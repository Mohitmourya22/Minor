"use client";
import { useRef, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { payForBooking, verifyPayment } from "@/lib/services/payment.service";
import { PaymentDismissedError, type CheckoutResult } from "@/lib/payments/razorpay";
import type { Booking } from "@/lib/types";

/**
 * Online payment through Razorpay Checkout (UPI, cards, netbanking, wallets).
 * The amount always comes from the server; nothing the browser says can change the price.
 */
export default function RazorpayPayPanel({ booking, onPaid }: { booking: Booking; onPaid: (b: Booking) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsRecheck, setNeedsRecheck] = useState(false);
  const proof = useRef<CheckoutResult | null>(null); // kept if money was paid but our server could not be reached
  const amount = booking.amount ?? 0;

  async function run(action: () => Promise<Booking>) {
    setBusy(true); setErr(null);
    try {
      const paid = await action();
      proof.current = null; setNeedsRecheck(false);
      onPaid(paid);
    } catch (e) {
      if (e instanceof PaymentDismissedError) {
        setErr("Payment was not completed. You have not been charged. You can try again.");
      } else if (proof.current) {
        setNeedsRecheck(true);
        setErr((e as Error).message || "We could not confirm your payment yet.");
      } else {
        setErr((e as Error).message || "Could not start the payment. Please try again.");
      }
    } finally { setBusy(false); }
  }

  const pay = () => run(() => payForBooking(booking, (r) => { proof.current = r; }));
  const recheck = () => run(() => verifyPayment(proof.current as CheckoutResult));

  return (
    <div className="form pay-panel">
      <b className="pay-amount">Pay ₹{amount}</b>
      <div className="muted">Pay securely with UPI, card, netbanking or wallet.</div>

      {err && <div className="error-state" role="alert">{err}</div>}

      {needsRecheck ? (
        <>
          <div className="muted">If money was deducted, do not pay again. Tap below to confirm it.</div>
          <button className="btn btn-primary pay-btn" type="button" onClick={recheck} disabled={busy}>
            {busy ? "Checking…" : "Check payment status"}
          </button>
        </>
      ) : (
        <button className="btn btn-primary pay-btn" type="button" onClick={pay} disabled={busy || !booking.id}>
          <Lock size={15} aria-hidden="true" /> {busy ? "Please wait…" : `Pay ₹${amount} securely`}
        </button>
      )}

      <small className="muted pay-note">
        <ShieldCheck size={13} aria-hidden="true" /> Payments are processed by Razorpay. We never see or store your card or UPI details.
        Your booking is confirmed automatically after payment.
      </small>
    </div>
  );
}
