import { after } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rateLimit";
import { json, route } from "@/lib/server/http";
import { assertBookingSlotOk, bookingSchema, parseBody } from "@/lib/server/validation";
import { createBookingForUser } from "@/lib/server/bookings";
import { notifyDoctorEmail } from "@/lib/server/notify";
import { toBooking } from "@/lib/server/mappers";

/**
 * Creates the booking as "Awaiting payment". The browser then opens Razorpay Checkout
 * (POST /api/payments/order -> pay -> POST /api/payments/verify).
 * (Free services — fee 0 — are confirmed here and the doctor is notified right away.)
 */
export const POST = route(async (req) => {
  const userId = await requireUserId();
  await rateLimit("booking", userId, 10, 600);
  const input = await parseBody(req, bookingSchema);
  assertBookingSlotOk(input.date, input.time);

  const { row, needsNotify } = await createBookingForUser(userId, input);
  if (needsNotify) after(() => notifyDoctorEmail(row.id));

  return json(toBooking(row), 201);
});
