import { clerkClient } from "@clerk/nextjs/server";
import { requireUserId } from "@/lib/server/auth";
import { requireDoctor } from "@/lib/server/doctor";
import { json, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";
import { toPrescription, type PrescriptionRow } from "@/lib/server/mappers";

/**
 * POST /api/prescriptions
 * Doctor-only: save a prescription linked to the patient by email.
 */
export const POST = route(async (req) => {
  // RBAC: only doctors can save prescriptions
  await requireDoctor();

  const body = await req.json() as {
    rxRef: string;
    patientEmail: string;
    patientName: string;
    patientAge: string;
    patientGender: string;
    patientPhone: string;
    bookingRef?: string;
    issuedDate: string;
    data: object;
  };

  if (!body.rxRef || !body.patientEmail || !body.data) {
    throw { status: 400, code: "BAD_REQUEST", message: "rxRef, patientEmail, and data are required." };
  }

  const doctorId = await requireUserId();
  const supabase = db();

  const row = {
    rx_ref: body.rxRef,
    doctor_id: doctorId,
    patient_email: body.patientEmail.toLowerCase().trim(),
    patient_name: body.patientName || "",
    patient_age: body.patientAge || "",
    patient_gender: body.patientGender || "",
    patient_phone: body.patientPhone || "",
    booking_ref: body.bookingRef || null,
    data: body.data,
    issued_date: body.issuedDate,
  };

  // Upsert: if same rx_ref already exists, update it (doctor edits)
  const { data, error } = await supabase
    .from("prescriptions")
    .upsert(row, { onConflict: "rx_ref" })
    .select()
    .single();

  if (error) {
    console.error("[prescriptions] insert error:", error.message);
    throw { status: 500, code: "SERVER_ERROR", message: "Could not save prescription." };
  }

  return json(toPrescription(data as PrescriptionRow), 201);
});

/**
 * GET /api/prescriptions
 * Patient: returns their own prescriptions (matched by Clerk email).
 * Doctor: returns all prescriptions they issued.
 */
export const GET = route(async () => {
  const userId = await requireUserId();
  const supabase = db();

  // Resolve Clerk user to get email + role
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string } | undefined)?.role;
  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? "";

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
    throw { status: 500, code: "SERVER_ERROR", message: "Could not fetch prescriptions." };
  }

  return json((data as PrescriptionRow[]).map(toPrescription));
});

