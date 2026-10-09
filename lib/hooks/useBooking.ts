"use client";
import { useState } from "react";
import { createBooking, getLatestBooking } from "@/lib/services/booking.service";
import { useResource } from "./useResource";
import type { Booking } from "@/lib/types";

export function useBooking() {
  const res = useResource<Booking | null>(getLatestBooking, null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function book(b: Booking) {
    setSaving(true); setSaveError(null);
    try { res.setData(await createBooking(b)); return true; }
    catch (e) { setSaveError((e as Error).message); return false; }
    finally { setSaving(false); }
  }
  return { ...res, booking: res.data, book, saving, saveError };
}
