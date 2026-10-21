import { z } from "zod";
import { requireDoctor } from "@/lib/server/doctor";
import { badRequest, json, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { confirmManualPayment } from "@/lib/server/bookings";

const schema = z.object({ bookingId: z.string().uuid() });

/** Doctor confirms the money arrived (same effect as the button in the email). */
export const POST = route(async (req) => {
  await requireDoctor();
  const { bookingId } = await parseBody(req, schema);
  const row = await confirmManualPayment(bookingId);
  if (!row) throw badRequest("Booking not found.");
  return json({ id: row.id, ref: row.ref, paymentStatus: row.payment_status, status: row.status });
});
