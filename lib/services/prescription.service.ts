import { ENV } from "@/lib/config/env";
import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { mockRead, mockWrite } from "./mockStore";
import type { PrescriptionData } from "@/lib/types/prescription";

export interface SavedPrescription extends PrescriptionData {
  id: string;
  rxRef: string;
  issuedDate: string;
}

/** Patient (or doctor): fetch prescriptions accessible to the current user. */
export async function getPrescriptions(): Promise<SavedPrescription[]> {
  if (ENV.USE_MOCKS) return mockRead<SavedPrescription[]>("prescriptions", []);
  return apiRequest<SavedPrescription[]>(API_ENDPOINTS.prescriptions.list);
}

/** Doctor only: save/update a prescription and link it to the patient by email. */
export async function savePrescription(
  data: PrescriptionData,
  patientEmail: string,
): Promise<SavedPrescription> {
  if (ENV.USE_MOCKS) {
    const saved: SavedPrescription = {
      ...data,
      id: data.id,
      rxRef: data.id,
      issuedDate: data.date,
    };
    const existing = mockRead<SavedPrescription[]>("prescriptions", []);
    const updated = [saved, ...existing.filter((p) => p.rxRef !== saved.rxRef)];
    mockWrite("prescriptions", updated);

    // Also write to a per-email key so patient mock reads work
    const patientKey = `prescriptions_${patientEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const patientList = mockRead<SavedPrescription[]>(patientKey, []);
    mockWrite(patientKey, [saved, ...patientList.filter((p) => p.rxRef !== saved.rxRef)]);

    return saved;
  }

  return apiRequest<SavedPrescription>(API_ENDPOINTS.prescriptions.create, {
    method: "POST",
    body: {
      rxRef: data.id,
      patientEmail,
      patientName: data.patient.name,
      patientAge: data.patient.age,
      patientGender: data.patient.gender,
      patientPhone: data.patient.phone,
      bookingRef: data.patient.bookingRef,
      issuedDate: data.date,
      data,
    },
  });
}

