"use client";
import { getPrescriptions, type SavedPrescription } from "@/lib/services/prescription.service";
import { useResource } from "./useResource";

/** Fetch prescriptions for the signed-in user (patient sees own; doctor sees all issued). */
export function usePrescriptions() {
  const res = useResource<SavedPrescription[]>(getPrescriptions, []);
  return { ...res, prescriptions: res.data };
}

