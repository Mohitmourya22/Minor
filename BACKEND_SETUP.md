# AayuMarg backend — setup guide

What it is: Next.js API routes (`app/api/**`) + **Supabase** (database + private file storage) +
**Razorpay** (payments) + email alerts to the doctor (Gmail). Login stays with Clerk.

## Booking flow
1. Patient fills the OPD form → `POST /api/bookings` → saved as **Awaiting payment** (the server decides the fee and doctor).
2. `POST /api/payments/order` → Razorpay Checkout opens in the browser.
3. After paying → `POST /api/payments/verify` (HMAC signature check) → booking becomes **Confirmed**.
4. Same moment the doctor gets an **email** with the booking details.
5. Safety net: Razorpay's **webhook** confirms the booking even if the patient closes the tab before step 3.

## One-time setup
1. **Supabase**: create a project → SQL Editor → paste `supabase/schema.sql` → Run.
   Then Table editor → `doctors`: set each doctor's `whatsapp_number` (`+91XXXXXXXXXX`) and `fee_paise`
   (49900 = ₹499; `0` = free).  No code change is ever needed for this.
2. **Razorpay**: create account → use **Test mode** → copy Key ID + Secret.
   Webhooks → add `https://YOUR-DOMAIN/api/webhooks/razorpay`, event **payment.captured**, secret = `RAZORPAY_WEBHOOK_SECRET`.
3. **Email**: Gmail App Password → `GMAIL_USER`, `GMAIL_APP_PASSWORD` (see `.env.example`).
4. Copy `.env.example` → `.env.local`, fill every value, set `NEXT_PUBLIC_USE_MOCKS=false`. Add the same variables on Vercel.
5. Test: Razorpay test card/UPI, check the Supabase `bookings` row (`payment_status = paid`, `doctor_notified_at` filled).

## Privacy rules built in
- Every query is filtered by the signed-in Clerk user id; the database accepts no direct browser access (RLS on, no policies).
- Medical files are in a **private** bucket, content-type checked by real file bytes.
- WhatsApp never contains the patient's *reason* for Mental / Sexual Health, and shows only "Confidential consultation".
- Failed WhatsApp sends never break a payment; the error is saved in `bookings.notify_error`.

## Not built yet (ideas)
Doctor portal to read full details · email/WhatsApp receipt to the patient · refunds/cancellation ·
rate limiting (e.g. Upstash) · AI endpoints · files larger than 4 MB (needs direct-to-storage upload).

## Razorpay (current)
Test first: put `rzp_test_` keys in `.env.local`, restart `npm run dev`, book a service and pay with Razorpay's test UPI / test card.
Live: replace the three RAZORPAY_* values (Vercel env vars) with `rzp_live_` keys + the live-mode webhook, then redeploy.
In the Razorpay dashboard keep **payment capture = Automatic** (the verify route also captures an "authorized" payment as a fallback).
Run `supabase/migration_razorpay.sql` once. The old UPI-QR routes and `CONFIRM_SECRET` are removed.
Twilio WhatsApp is not used; doctor alerts are sent by email.

## Rate limiting (Upstash)
`lib/server/rateLimit.ts` limits booking, payment, upload, profile, vitals and prescription calls per user (and the public pricing call per IP). Create a free Upstash Redis database and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (local + Vercel). Without them the limiter is off; if Upstash is down, requests are allowed so payments never get blocked. The Razorpay webhook is not rate limited (it is protected by its signature).
