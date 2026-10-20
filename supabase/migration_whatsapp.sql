-- Run ONCE in Supabase -> SQL Editor. Safe to re-run.
alter table public.bookings add column if not exists whatsapp text;
