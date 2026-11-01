import { after } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rateLimit";
import { HttpError, badRequest, json, notFound, route } from "@/lib/server/http";
import { parseBody, verifyPaymentSchema } from "@/lib/server/validation";
import { capturePayment, fetchPayment, verifyCheckoutSignature } from "@/lib/server/razorpay";
import { confirmPayment } from "@/lib/server/bookings";
import { notifyDoctor } from "@/lib/server/notify";
import { toBooking } from "@/lib/server/mappers";

/**
 * Step 3: Razorpay Checkout succeeded in the browser. We do NOT trust the browser:
 *  1. recompute the HMAC signature with our secret,
 *  2. ask Razorpay directly for the payment (must belong to this order, be INR, and be captured),
 *  3. confirmPayment() compares the paid amount with the fee we stored when the booking was made.
 * Only then is the booking confirmed and the doctor emailed.
 */
export const POST = route(async (req) => {
  const userId = await requireUserId();
  await rateLimit("pay-verify", userId, 20, 600);
  const p = await parseBody(req, verifyPaymentSchema);

  if (!verifyCheckoutSignature(p.razorpay_order_id, p.razorpay_payment_id, p.razorpay_signature)) {
    throw badRequest("Payment could not be verified.");
  }

  let payment = await fetchPayment(p.razorpay_payment_id);
  if (payment.order_id !== p.razorpay_order_id || payment.currency !== "INR") {
    console.error(`[payment] order/currency mismatch for ${p.razorpay_payment_id}`);
    throw badRequest("Payment could not be verified.");
  }
  if (payment.status === "authorized") payment = await capturePayment(payment.id, payment.amount);
  if (payment.status !== "captured") {
    throw new HttpError(409, "PAYMENT_PENDING", "Your payment is not completed yet. If money was deducted it will be confirmed automatically or refunded by your bank.");
  }

  const result = await confirmPayment({
    orderId: p.razorpay_order_id, paymentId: payment.id, paidAmountPaise: payment.amount, userId,
  });
  if (!result) throw notFound("Booking not found.");

  if (result.firstTime) after(() => notifyDoctor(result.row.id));
  return json(toBooking(result.row));
});
