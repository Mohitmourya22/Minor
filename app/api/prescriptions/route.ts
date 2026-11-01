import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { requireUserId } from "@/lib/server/auth";
import { requireDoctor } from "@/lib/server/doctor";
import { rateLimit } from "@/lib/server/rateLimit";
import { HttpError, json, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { db } from "@/lib/server/supabase";
import { toPrescription, type PrescriptionRow } from "@/lib/server/mappers";

const prescriptionSchema = z.object({
  rxRef: z.string().trim().min(3).max(60).regex(/^[A-Za-z0-9_-]+$/, "Invalid prescription reference."),
  patientEmail: z.string().trim().max(200).pipe(z.email()),
  patientName: z.string().trim().max(100).default(""),
  patientAge: z.string().trim().max(10).default(""),
  patientGender: z.string().trim().max(30).default(""),
  patientPhone: z.string().trim().max(30).default(""),
  bookingRef: z.string().trim().max(30).optional(),
  issuedDate: z.string().trim().min(1).max(40),
  data: z.record(z.string(), z.unknown()).refine((d) => JSON.stringify(d).length <= 200_000, "Prescription is too large."),
});

/**
 * POST /api/prescriptions
 * Doctor-only: save a prescription linked to the patient by email.
 */
export const POST = route(async (req) => {
  // RBAC: only doctors can save prescriptions
  const doctorKey = await requireDoctor();
  await rateLimit("rx-save", doctorKey, 60, 600);
  const body = await parseBody(req, prescriptionSchema);

  const doctorId = await requireUserId();
  const supabase = db();

  // A doctor may edit only their OWN prescriptions (same rx_ref from another doctor = rejected).
  const { data: existing, error: exErr } = await supabase
    .from("prescriptions").select("doctor_id").eq("rx_ref", body.rxRef).maybeSingle();
  if (exErr) {
    console.error("[prescriptions] lookup error:", exErr.message);
    throw new HttpError(500, "SERVER_ERROR", "Could not save prescription.");
  }
  if (existing && (existing as { doctor_id: string }).doctor_id !== doctorId) {
    throw new HttpError(403, "FORBIDDEN", "This prescription belongs to another doctor.");
  }

  const row = {
    rx_ref: body.rxRef,
    doctor_id: doctorId,
    patient_email: body.patientEmail.toLowerCase(),
    patient_name: body.patientName,
    patient_age: body.patientAge,
    patient_gender: body.patientGender,
    patient_phone: body.patientPhone,
    booking_ref: body.bookingRef || null,
    data: body.data,
    issued_date: body.issuedDate,
  };

  // Upsert: if same rx_ref already exists (and is theirs), update it (doctor edits)
  const { data, error } = await supabase
    .from("prescriptions")
    .upsert(row, { onConflict: "rx_ref" })
    .select()
    .single();

  if (error) {
    console.error("[prescriptions] insert error:", error.message);
    throw new HttpError(500, "SERVER_ERROR", "Could not save prescription.");
  }

  return json(toPrescription(data as PrescriptionRow), 201);
});

/**
 * GET /api/prescriptions
 * Patient: returns their own prescriptions (matched by their VERIFIED primary Clerk email).
 * Doctor: returns all prescriptions they issued.
 */
export const GET = route(async () => {
  const userId = await requireUserId();
  const supabase = db();

  // Resolve Clerk user to get email + role
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string } | undefined)?.role;
  // Only a verified primary email may be used to match prescriptions (an unverified address could be someone else's).
  const primary = user.primaryEmailAddress;
  const email = primary && primary.verification?.status === "verified" ? primary.emailAddress.toLowerCase() : "";

  let query;
  if (role === "doctor") {
    // Doctor sees all prescriptions they wrote
    query = supabase
      .from("prescriptions")
      .select("*")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
  } else {
    // Patient sees only their own (matched by email)
    if (!email) return json([]);
    query = supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_email", email)
      .order("created_at", { ascending: false })
      .limit(50);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[prescriptions] fetch error:", error.message);
    throw new HttpError(500, "SERVER_ERROR", "Could not fetch prescriptions.");
  }

  return json((data as PrescriptionRow[]).map(toPrescription));
});
