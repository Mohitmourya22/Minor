import { requireDoctor } from "@/lib/server/doctor";
import { db } from "@/lib/server/supabase";
import { HttpError, json, route } from "@/lib/server/http";
import type { DoctorBooking } from "@/lib/types";

/** Every booking (newest first) with the patient's profile details. Doctors only. */
export const GET = route(async () => {
  await requireDoctor();
  const supabase = db();

  const { data: rows, error } = await supabase.from("bookings").select("*")
    .order("created_at", { ascending: false }).limit(300);
  if (error) {
    console.error("[doctor] bookings list:", error.message);
    throw new HttpError(500, "SERVER_ERROR", "Something went wrong.");
  }

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];
  const profiles = new Map<string, Record<string, string>>();
  if (userIds.length) {
    const { data: ps, error: pErr } = await supabase.from("profiles")
      .select("user_id, name, age, gender, phone, city, state").in("user_id", userIds);
    if (pErr) console.error("[doctor] profiles:", pErr.message);
    for (const p of ps ?? []) profiles.set(p.user_id as string, p as Record<string, string>);
  }

  const out: DoctorBooking[] = (rows ?? []).map((r) => {
    const p = profiles.get(r.user_id as string);
    return {
      id: r.id, ref: r.ref, createdAt: r.created_at,
      category: r.category, service: r.service,
      date: r.booking_date, time: String(r.booking_time).slice(0, 5),
      reason: r.reason ?? "", attachments: r.attachments ?? [],
      patientName: r.patient_name || p?.name || "Patient",
      accountName: p?.name || "", age: p?.age || "", gender: p?.gender || "",
      city: [p?.city, p?.state].filter(Boolean).join(", "),
      whatsapp: r.whatsapp || "", profilePhone: p?.phone || "",
      amount: (r.amount_paise ?? 0) / 100,
      paymentStatus: r.payment_status, status: r.status, utr: r.utr ?? "",
      confidential: r.category === "mental-health" || r.category === "sexual-health",
    };
  });
  return json(out);
});
