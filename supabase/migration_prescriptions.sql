-- =====================================================================
-- AayuMarg: Prescriptions table
-- Run in Supabase dashboard -> SQL Editor -> New query -> Run
-- Prescriptions are written by the doctor, linked to a patient by email.
-- =====================================================================

create table if not exists public.prescriptions (
  id             uuid primary key default gen_random_uuid(),
  rx_ref         text not null unique,            -- e.g. AM-RX-2026-1234
  doctor_id      text not null,                   -- Clerk user_id of the doctor
  patient_email  text not null,                   -- patient's Clerk email (for linking)
  patient_name   text not null default '',
  patient_age    text not null default '',
  patient_gender text not null default '',
  patient_phone  text not null default '',
  booking_ref    text,                            -- optional: links back to a booking
  data           jsonb not null,                  -- full PrescriptionData JSON blob
  issued_date    text not null,
  created_at     timestamptz not null default now()
);

create index if not exists prescriptions_patient_email_idx
  on public.prescriptions (patient_email, created_at desc);

create index if not exists prescriptions_doctor_id_idx
  on public.prescriptions (doctor_id, created_at desc);

