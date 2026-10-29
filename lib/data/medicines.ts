import { MedicineForm } from '../types/prescription';

export interface MedicineCatalogItem {
  name: string;
  strength: string;
  form: MedicineForm;
  category: string;
}

export interface DosageFrequencyOption {
  code: string; // "1-0-1"
  label: string; // e.g. "1-0-1 · Twice daily (सुबह और रात)"
  hindi: string; // "सुबह और रात"
  english: string; // "Twice a day (Morning & Night)"
  timingPill: string;
}

export const MEDICINE_CATALOG: MedicineCatalogItem[] = [
  // Analgesic & Antipyretic
  { name: 'Dolo (Paracetamol)', strength: '650 mg', form: 'Tab', category: 'Fever & Pain' },
  { name: 'Paracetamol', strength: '500 mg', form: 'Tab', category: 'Fever & Pain' },
  { name: 'Combiflam (Ibuprofen + Paracetamol)', strength: '400mg + 325mg', form: 'Tab', category: 'Pain & Inflammation' },
  { name: 'Meftal-Spas (Mefenamic + Dicyclomine)', strength: '250mg + 10mg', form: 'Tab', category: 'Spasm & Pain' },
  { name: 'Voveran (Diclofenac Sodium)', strength: '50 mg', form: 'Tab', category: 'Joint & Body Pain' },

  // Antibiotics
  { name: 'Augmentin (Amoxicillin + Pot. Clavulanate)', strength: '625 mg', form: 'Tab', category: 'Antibiotic' },
  { name: 'Azithral (Azithromycin)', strength: '500 mg', form: 'Tab', category: 'Antibiotic' },
  { name: 'Taxim-O (Cefixime)', strength: '200 mg', form: 'Tab', category: 'Antibiotic' },
  { name: 'Ciplox (Ciprofloxacin)', strength: '500 mg', form: 'Tab', category: 'Antibiotic' },
  { name: 'Moxikind-CV (Amoxicillin + Clav)', strength: '375 mg', form: 'Tab', category: 'Antibiotic' },

  // Antacid & Gastrointestinal
  { name: 'Pan (Pantoprazole)', strength: '40 mg', form: 'Tab', category: 'Acidity & Reflux' },
  { name: 'Pantocid DSR (Pantoprazole + Domperidone)', strength: '40mg + 30mg', form: 'Cap', category: 'Acidity & Nausea' },
  { name: 'Omez (Omeprazole)', strength: '20 mg', form: 'Cap', category: 'Acidity & Heartburn' },
  { name: 'Rantac (Ranitidine)', strength: '150 mg', form: 'Tab', category: 'Acidity' },
  { name: 'Ondem (Ondansetron)', strength: '4 mg', form: 'Tab', category: 'Nausea & Vomiting' },
  { name: 'Digene', strength: '10 ml', form: 'Syp', category: 'Antacid Syrup' },
  { name: 'Econorm (Saccharomyces boulardii)', strength: '250 mg', form: 'Sachet', category: 'Gut Flora' },

  // Antiallergic & Respiratory
  { name: 'Cetirizine (Cetzine)', strength: '10 mg', form: 'Tab', category: 'Allergy & Cold' },
  { name: 'Allegra (Fexofenadine)', strength: '120 mg', form: 'Tab', category: 'Allergy & Rhinitis' },
  { name: 'Montair-LC (Montelukast + Levocetirizine)', strength: '10mg + 5mg', form: 'Tab', category: 'Allergic Cough & Asthma' },
  { name: 'Ascoril-D Plus (Cough Formula)', strength: '100 ml', form: 'Syp', category: 'Dry Cough' },
  { name: 'Grilinctus BM (Terbutaline + Bromhexine)', strength: '100 ml', form: 'Syp', category: 'Wet Cough' },
  { name: 'Otrivin Adult Nasal Drops', strength: '0.1%', form: 'Drops', category: 'Nasal Decongestant' },

  // Chronic & Geriatric (Cardio, Diabetes, Hypertension)
  { name: 'Telma (Telmisartan)', strength: '40 mg', form: 'Tab', category: 'Hypertension' },
  { name: 'Amlong (Amlodipine)', strength: '5 mg', form: 'Tab', category: 'Hypertension' },
  { name: 'Glycomet (Metformin hydrochloride)', strength: '500 mg', form: 'Tab', category: 'Diabetes' },
  { name: 'Glycomet-GP 1 (Metformin + Glimepiride)', strength: '500mg + 1mg', form: 'Tab', category: 'Diabetes' },
  { name: 'Atorva (Atorvastatin)', strength: '10 mg', form: 'Tab', category: 'Cholesterol' },
  { name: 'Ecosprin (Aspirin)', strength: '75 mg', form: 'Tab', category: 'Cardiovascular' },

  // Vitamins, Supplements & Hydration
  { name: 'Becosules Z (B-Complex + Zinc + C)', strength: 'Cap', form: 'Cap', category: 'Vitamins & Energy' },
  { name: 'Shelcal 500 (Calcium + Vitamin D3)', strength: '500 mg', form: 'Tab', category: 'Bone Health' },
  { name: 'Neurobion Forte', strength: 'Tab', form: 'Tab', category: 'Nerve & Vit B' },
  { name: 'Electral / ORS Powder (WHO formula)', strength: '21.8 g', form: 'Sachet', category: 'Rehydration' },
  { name: 'Zincovit', strength: 'Tab', form: 'Tab', category: 'Immunity & Zinc' },

  // Topicals
  { name: 'Betadine (Povidone Iodine 5%)', strength: '15 g', form: 'Oint', category: 'Antiseptic' },
  { name: 'Volini / Voveran Gel', strength: '30 g', form: 'Gel', category: 'Pain Relief' },
];

export const DOSAGE_FREQUENCIES: DosageFrequencyOption[] = [
  {
    code: '1-0-1',
    label: '1-0-1 · Twice daily (सुबह और रात)',
    hindi: 'सुबह और रात (भोजन उपरांत)',
    english: 'Twice daily (Morning & Night)',
    timingPill: 'Morning & Night',
  },
  {
    code: '1-0-0',
    label: '1-0-0 · Once daily — Morning (सुबह)',
    hindi: 'सुबह केवल (एक बार)',
    english: 'Once daily (Morning only)',
    timingPill: 'Morning',
  },
  {
    code: '0-0-1',
    label: '0-0-1 · Once daily — Night (रात को)',
    hindi: 'रात को (सोने से पहले)',
    english: 'Once daily (Night only)',
    timingPill: 'Night',
  },
  {
    code: '0-1-0',
    label: '0-1-0 · Once daily — Afternoon (दोपहर)',
    hindi: 'दोपहर में केवल',
    english: 'Once daily (Afternoon)',
    timingPill: 'Afternoon',
  },
  {
    code: '1-1-1',
    label: '1-1-1 · Thrice daily (सुबह, दोपहर और रात)',
    hindi: 'सुबह, दोपहर और रात (तीन बार)',
    english: 'Thrice daily (Morning, Noon & Night)',
    timingPill: '3 Times / Day',
  },
  {
    code: '1-1-0',
    label: '1-1-0 · Morning & Afternoon (सुबह और दोपहर)',
    hindi: 'सुबह और दोपहर',
    english: 'Twice daily (Morning & Afternoon)',
    timingPill: 'Morning & Noon',
  },
  {
    code: '1-0-1-1',
    label: '1-0-1-1 · Four times daily (दिन में ४ बार)',
    hindi: 'दिन में चार बार (६ घंटे पर)',
    english: 'Four times daily (every 6 hours)',
    timingPill: '4 Times / Day',
  },
  {
    code: 'SOS',
    label: 'SOS · As needed (जरूरत पड़ने पर)',
    hindi: 'दर्द / परेशानी होने पर',
    english: 'Take only when needed for severe symptoms',
    timingPill: 'As needed',
  },
  {
    code: 'STAT',
    label: 'STAT · Immediately (तुरंत)',
    hindi: 'तुरंत (एक खुराक)',
    english: 'Single dose immediately',
    timingPill: 'Immediate',
  },
];

export const TIMING_OPTIONS = [
  { value: 'After food', label: 'After food (भोजन के बाद)' },
  { value: 'Before food', label: 'Before food (भोजन से पहले — खाली पेट)' },
  { value: 'With food', label: 'With food (भोजन के साथ)' },
  { value: 'At bedtime', label: 'At bedtime (सोने से पहले)' },
  { value: 'Empty stomach in morning', label: 'Empty stomach in morning (सुबह खाली पेट)' },
];

export const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '1 month',
  'Continuous / Review',
];

export const COMMON_SYMPTOMS = [
  'Fever & Chills',
  'Dry Cough',
  'Wet Cough with Phlegm',
  'Sore Throat',
  'Headache',
  'Body Ache & Fatigue',
  'Acidity & Heartburn',
  'Abdominal Pain',
  'Loose Motions',
  'Nausea & Vomiting',
  'Chest Congestion',
  'Hypertension follow-up',
  'Diabetes follow-up',
  'Joint Pain & Stiffness',
];

/**
 * DEFAULT_DOCTOR_INFO — Dr. Shikhar Chepe (hardcoded default).
 * Multi-doctor extensibility: this object is injected as initial React state
 * in PrescriptionGenerator, so any doctor can override fields dynamically
 * via the PrescriptionFooter editor without changing this constant.
 */
export const DEFAULT_DOCTOR_INFO = {
  name: 'Dr. Shikhar Chepe',
  qualifications: 'MBBS',
  regNumber: 'CGMC 14529/2024',
  clinicName: 'AayuMarg Healthcare',
  department: 'General Medicine',
  phone: '+91 9243545455',
  email: 'doctor@aayumarg.com',
  address: '69/107, Near Shehnai Garden, Rohinipuram, Raipur',
  signatureText: 'Dr. Shikhar Chepe, MBBS',
};

