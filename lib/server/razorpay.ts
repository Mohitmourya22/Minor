import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

const API = "https://api.razorpay.com/v1";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
}

const basicAuth = () =>
  "Basic " + Buffer.from(`${requireEnv("RAZORPAY_KEY_ID")}:${requireEnv("RAZORPAY_KEY_SECRET")}`).toString("base64");

/** Create a payment order. Amount is in PAISE and is decided by OUR server, never the browser. */
export async function createOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: basicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay order failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Ask Razorpay itself what happened to a payment (never trust only what the browser says). */
export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw new Error("Bad payment id");
  const res = await fetch(`${API}/payments/${paymentId}`, {
    headers: { Authorization: basicAuth() },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay payment fetch failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayPayment;
}

/** If auto-capture is OFF in the Razorpay dashboard a paid payment stays "authorized" and is refunded after ~5 days. Capture it here. */
export async function capturePayment(paymentId: string, amountPaise: number): Promise<RazorpayPayment> {
  const res = await fetch(`${API}/payments/${paymentId}/capture`, {
    method: "POST",
    headers: { Authorization: basicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay capture failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayPayment;
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Checkout callback proof: HMAC_SHA256(order_id + "|" + payment_id, key_secret) must equal
 * the signature Razorpay gave the browser. Only Razorpay (and we) know the secret.
 */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret = requireEnv("RAZORPAY_KEY_SECRET")): boolean {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook proof: HMAC_SHA256(raw request body, webhook secret) must equal x-razorpay-signature. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret = requireEnv("RAZORPAY_WEBHOOK_SECRET")): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
