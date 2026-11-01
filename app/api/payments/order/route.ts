import { requireUserId } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rateLimit";
import { db } from "@/lib/server/supabase";
import { HttpError, conflict, json, notFound, route } from "@/lib/server/http";
import { createOrderSchema, parseBody } from "@/lib/server/validation";
import { createOrder } from "@/lib/server/razorpay";
import { requireEnv } from "@/lib/server/env";
import type { BookingRow } from "@/lib/server/mappers";

/** Step 2 of booking: create (or reuse) a Razorpay order for the caller's own unpaid booking. */
export const POST = route(async (req) => {
  const userId = await requireUserId();
  await rateLimit("pay-order", userId, 10, 600);
  const { bookingId } = await parseBody(req, createOrderSchema);
  const supabase = db();

  const { data, error } = await supabase.from("bookings").select("*")
    .eq("id", bookingId).eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("[db] order lookup:", error.message);
    throw new HttpError(500, "SERVER_ERROR", "Something went wrong.");
  }
  if (!data) throw notFound("Booking not found.");
  const b = data as BookingRow;

  if (b.payment_status === "paid") throw conflict("This booking is already paid.");
  if (b.amount_paise <= 0) throw conflict("This booking needs no payment.");

  let orderId = b.razorpay_order_id;
  if (!orderId) {
    const order = await createOrder({
      amountPaise: b.amount_paise,
      receipt: b.ref,
      notes: { bookingId: b.id, ref: b.ref },
    });
    // Only the first of two simultaneous clicks may store its order; the other one re-reads the winner.
    const { data: saved, error: uErr } = await supabase.from("bookings")
      .update({ razorpay_order_id: order.id }).eq("id", b.id).is("razorpay_order_id", null).select("razorpay_order_id");
    if (uErr) {
      console.error("[db] save order id:", uErr.message);
      throw new HttpError(500, "SERVER_ERROR", "Something went wrong.");
    }
    if (saved && saved.length === 1) {
      orderId = order.id;
    } else {
      const { data: again } = await supabase.from("bookings").select("razorpay_order_id").eq("id", b.id).maybeSingle();
      orderId = (again as { razorpay_order_id: string | null } | null)?.razorpay_order_id ?? null;
      if (!orderId) throw new HttpError(500, "SERVER_ERROR", "Something went wrong.");
    }
  }

  return json({
    orderId,
    amount: b.amount_paise,   // paise
    currency: "INR",
    keyId: requireEnv("RAZORPAY_KEY_ID"), // public key id (safe for the browser)
    bookingRef: b.ref,
  });
});
