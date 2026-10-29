export type MedicineForm =
  | 'Tab'
  | 'Cap'
  | 'Syp'
  | 'Susp'
  | 'Drops'
  | 'Inj'
  | 'Oint'
  | 'Gel'
  | 'Inhaler'
  | 'Sachet';

export interface PrescriptionMedicine {
  id: string;
  name: string;
  strength: string;
  form: MedicineForm;
  dosageFrequency: string; // e.g. "1-0-1"
  dosageLabel: string; // e.g. "Twice daily · Subah & Raat (सुबह और रात)"
  timing: string; // e.g. "After food (भोजन के बाद)"
  duration: string; // e.g. "5 days"
  instructions?: string; // e.g. "Take with warm water"
}

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  phone: string;
  history: string; // past illnesses, allergies, chronic conditions
  vitalsSummary?: string; // e.g. "BP: 124/82 mmHg, HR: 74 bpm"
  address?: string;
  bookingRef?: string;
}

export interface DoctorInfo {
  name: string;
  qualifications: string;
  regNumber: string;
  clinicName: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  signatureText?: string;
}

export interface PrescriptionData {
  id: string;
  date: string;
  patient: PatientInfo;
  chiefComplaints: string;
  diagnosis?: string;
  medicines: PrescriptionMedicine[];
  generalAdvice?: string;
  investigations?: string;
  nextFollowUp?: string;
  doctor: DoctorInfo;
}

