-- Run ONCE in Supabase -> SQL Editor (Razorpay payments + security hardening). Safe to re-run.

-- 1) One Razorpay payment can confirm only ONE booking (stops a payment being reused).
create unique index if not exists bookings_razorpay_payment_unique
  on public.bookings (razorpay_payment_id) where razorpay_payment_id is not null;

-- 2) Prescriptions were missing row-level security. ON + no policies = the public (anon) key can read nothing.
alter table public.prescriptions enable row level security;

-- 3) Make sure every other table has it too (harmless if already on).
alter table public.profiles  enable row level security;
alter table public.vitals    enable row level security;
alter table public.documents enable row level security;
alter table public.doctors   enable row level security;
alter table public.bookings  enable row level security;
