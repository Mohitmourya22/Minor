import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { openCheckout, type CheckoutResult } from "@/lib/payments/razorpay";
import type { Booking } from "@/lib/types";

interface OrderResponse { orderId: string; amount: number; currency: string; keyId: string; bookingRef: string }

/** Step 1: ask OUR server for a Razorpay order (the server decides the amount). */
async function createOrder(booking: Booking): Promise<OrderResponse> {
  if (!booking.id) throw new Error("This booking cannot be paid yet. Please refresh and try again.");
  return apiRequest<OrderResponse>(API_ENDPOINTS.payments.order, { method: "POST", body: { bookingId: booking.id } });
}

/** Step 3: send Razorpay's proof to OUR server. It re-checks everything before confirming. */
export function verifyPayment(r: CheckoutResult): Promise<Booking> {
  return apiRequest<Booking>(API_ENDPOINTS.payments.verify, { method: "POST", body: r, timeoutMs: 30_000 });
}

/**
 * Whole online payment: create order -> open Razorpay Checkout -> verify on the server.
 * `onPaidInBrowser` runs as soon as Razorpay reports success, BEFORE server verification,
 * so the UI can keep the proof and retry verification if the network drops at that moment.
 */
export async function payForBooking(booking: Booking, onPaidInBrowser?: (r: CheckoutResult) => void): Promise<Booking> {
  const order = await createOrder(booking);
  const proof = await openCheckout({
    keyId: order.keyId, orderId: order.orderId, amount: order.amount, currency: order.currency,
    description: `Consultation ${order.bookingRef}`,
  });
  onPaidInBrowser?.(proof);
  return verifyPayment(proof);
}
