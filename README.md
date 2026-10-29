# AayuMarg — "We care"

AayuMarg is a calm digital space for families to manage a care profile, health vitals, medical records and OPD healthcare bookings. Patients book and pay by UPI; the doctor gets an email and manages every booking from a private **Doctor Panel**.

## Features
- **Care profile** — name, age, gender, phone, emergency contact (name + number), state / city / pincode / address (India), with strict validation on the browser *and* the server.
- **Vitals Vault** — BP, heart rate, SpO₂, temperature, sugar, weight, with realistic-range checks.
- **Medical records** — private file storage per user.
- **Healthcare booking** — OPD categories, WhatsApp number collected before payment, booking only from **2 hours ahead** (IST), reason limited to 150 words and sanitised.
- **Manual UPI payment** — patient pays by QR, submits the UTR; the doctor confirms from the email link or the Doctor Panel.
- **Doctor Panel (`/doctor`)** — all bookings, patient details, WhatsApp chat link, one-click payment confirmation. Doctors only.
- **Family care** — switch between family members.

## Tech stack
Next.js (App Router) · React · TypeScript · Clerk (auth) · Supabase (database + private storage) · Nodemailer / Gmail (email alerts) · zod (server validation) · lucide-react · plain CSS design tokens (`app/globals.css`).

## Installation
```bash
git clone https://github.com/Mohitmourya22/Minor.git
cd Minor
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev
```
Open http://localhost:3000. Node.js 20.9+ recommended.

## Environment variables
Full list with comments in `.env.example`. Add the same names on Vercel (Project → Settings → Environment Variables).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk login |
| `NEXT_PUBLIC_USE_MOCKS` | `true` = demo mode (browser storage). `false` = real backend (**required for the Doctor Panel**) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database + file storage (server only, never `NEXT_PUBLIC_`) |
| `CONFIRM_SECRET`, `APP_URL` | Sign the "Confirm payment" link in the doctor's email; your site address |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFY_EMAIL_TO` | Booking / payment emails to the doctor |

## Database setup (Supabase → SQL Editor)
Run once, in this order (all are safe to re-run):
1. `supabase/schema.sql` — base tables (new project only)
2. `supabase/migration_upi.sql` — UPI payment columns
3. `supabase/migration_whatsapp.sql` — patient WhatsApp number on bookings
4. `supabase/migration_profile.sql` — emergency contact name/number, state, city, pincode on profiles

## Doctor Panel setup
1. The doctor signs up / logs in to the website once.
2. Clerk Dashboard → **Users** → the doctor → **Public metadata** → Edit, then save:
   ```json
   { "role": "doctor" }
   ```
3. The doctor logs out and in again; **Doctor Panel** appears in the menu (or open `/doctor`).

Access is enforced on the server (`lib/server/doctor.ts`): every `/api/doctor/*` call checks the Clerk role and returns 403 to everyone else. Hiding the menu link is only cosmetic.

## Booking & payment flow
1. Patient fills the OPD form (WhatsApp number required) → booking saved as **Awaiting payment**; the doctor is emailed the patient's WhatsApp number.
2. Patient pays via UPI QR and submits the 12-digit UTR → **Payment submitted**; the patient sees *"A healthcare person will be in touch soon"* with the contact number (opens WhatsApp).
3. Doctor checks GPay, then presses **Confirm** (email link or Doctor Panel) → **Confirmed**.

Mental / Sexual Health bookings are shown as "Confidential consultation" in emails; the reason is visible only inside the login-protected Doctor Panel.

## Validation rules (browser + server)
Shared rules live in `lib/validation/` and are re-checked on the server with zod (`lib/server/validation.ts`).
- **Name:** letters and spaces only, 2–50 characters.
- **Age:** whole number, 1–150.
- **Phone / emergency / WhatsApp:** 10-digit Indian mobile starting 6–9 (`+91` accepted for WhatsApp).
- **Pincode:** 6 digits, not starting with 0. **Address:** safe characters only.
- **Vitals:** BP 70–250 / 40–150 (upper > lower), HR 30–220, SpO₂ 70–100, temp 90–108 °F, sugar 20–600, weight 1–300 kg, date not in the future or older than a year.
- **Booking:** at least 2 hours ahead and within 90 days (IST); reason ≤ 150 words with no `< > { }` or script text.

## Architecture
```
app/              pages: landing, dashboard, profile, vitals, documents, booking, doctor
app/api/          server routes: users, vitals, documents, bookings, payments, doctor, pricing
components/       AppNav, Footer, States, BookingCategories, UpiPayPanel, ContactSoon, AuthTokenBridge
lib/api/          client.ts (only fetch), endpoints.ts, errors.ts
lib/services/     profile / vitals / documents / booking  (mock OR real API)
lib/validation/   shared validators (common, profile, vitals, booking)
lib/data/         india-locations.json (states + cities)
lib/server/       server-only code: auth, doctor guard, bookings, notify (email), validation, supabase
lib/hooks/        useProfile, useVitals, useDocuments, useBooking, useAiChat
lib/config/       env.ts, upi.ts
mocks/            demo-mode data
supabase/         schema.sql + migrations
middleware.ts     Clerk route protection (/dashboard /profile /vitals /documents /booking /doctor)
```
Data flow: `UI → hook → service → API client → Next.js API route → Supabase`.
With `NEXT_PUBLIC_USE_MOCKS=true` services use browser storage instead of the API.

## Authentication & privacy
- Clerk handles login; `AuthTokenBridge` sends the session token to the API client as a Bearer token.
- Every patient query is filtered by the signed-in user id; the database accepts no direct browser access.
- Medical files are stored in a **private** bucket.
- The Supabase service-role key and all secrets stay on the server.

## Deployment
Standard Next.js: `npm run build && npm start`, or deploy to Vercel with the environment variables above. Run the SQL migrations on the same Supabase project the live site uses.

## More docs
- [BACKEND_SETUP.md](BACKEND_SETUP.md) — backend details (the Razorpay / Twilio parts are no longer used; UPI mode is current).
- [API_CONTRACT.md](API_CONTRACT.md) — REST routes.

## Known limitations
- Payments are manual UPI: the doctor verifies each one by hand.
- All doctors see all bookings (no per-category doctor split yet).
- No AI UI yet (service + hook are ready in `lib/ai/`).
- No rate limiting yet (e.g. Upstash) and no cancellation / refund flow.
- Hero/feature photos are hot-linked from Unsplash/Pexels; download them into `public/assets/` before production.
