-- Run ONCE in Supabase -> SQL Editor. Safe to re-run.
alter table public.profiles add column if not exists emergency_name  text not null default '';
alter table public.profiles add column if not exists emergency_phone text not null default '';
alter table public.profiles add column if not exists state   text not null default '';
alter table public.profiles add column if not exists city    text not null default '';
alter table public.profiles add column if not exists pincode text not null default '';
