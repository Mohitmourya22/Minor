'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  PrescriptionData,
  PatientInfo,
  DoctorInfo,
  PrescriptionMedicine,
} from '@/lib/types/prescription';
import { DEFAULT_DOCTOR_INFO } from '@/lib/data/medicines';
import PatientInfoCard from './PatientInfoCard';
import ChiefComplaints from './ChiefComplaints';
import RxBuilder from './RxBuilder';
import PrescriptionFooter from './PrescriptionFooter';
import PrescriptionDocument from './PrescriptionDocument';
import { useProfile } from '@/lib/hooks/useProfile';
import { useVitals } from '@/lib/hooks/useVitals';
import { useFamily } from '@/lib/family/FamilyContext';
import { savePrescription } from '@/lib/services/prescription.service';
import { usePrescriptions } from '@/lib/hooks/usePrescriptions';
import {
  Printer,
  Download,
  RotateCcw,
  Eye,
  Edit3,
  MessageCircle,
  Save,
  Lock,
  FileText,
} from 'lucide-react';

interface PrescriptionGeneratorProps {
  initialPatient?: Partial<PatientInfo>;
  onSaved?: (data: PrescriptionData) => void;
}

const SAMPLE_MEDICINES: PrescriptionMedicine[] = [
  {
    id: 'rx-default-1',
    name: 'Dolo (Paracetamol)',
    strength: '650 mg',
    form: 'Tab',
    dosageFrequency: '1-0-1',
    dosageLabel: '1-0-1 · Twice daily (सुबह और रात)',
    timing: 'After food',
    duration: '5 days',
    instructions: 'Take after food with water. Maintain 6-8 hrs gap.',
  },
  {
    id: 'rx-default-2',
    name: 'Pan (Pantoprazole)',
    strength: '40 mg',
    form: 'Tab',
    dosageFrequency: '1-0-0',
    dosageLabel: '1-0-0 · Once daily — Morning (सुबह)',
    timing: 'Before food',
    duration: '5 days',
    instructions: 'Take in morning empty stomach with warm water.',
  },
];

export default function PrescriptionGenerator({
  initialPatient,
  onSaved,
}: PrescriptionGeneratorProps) {
  const { user } = useUser();
  const { profile } = useProfile();
  const { vitals } = useVitals();
  const { active: activeFamilyMember } = useFamily();

  // RBAC: only Clerk users with role=doctor may write/edit
  const isDoctor = (user?.publicMetadata as { role?: string } | undefined)?.role === 'doctor';

  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [autoFetchedSource, setAutoFetchedSource] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Patient email for linking (doctor fills in)
  const [patientEmail, setPatientEmail] = useState<string>('');

  // Patient prescriptions (for patient view)
  const { prescriptions, status: rxStatus } = usePrescriptions();

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const generateRxId = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AM-RX-${new Date().getFullYear()}-${rand}`;
  };

  const [prescriptionId] = useState<string>(generateRxId());

  // Patient State
  const [patient, setPatient] = useState<PatientInfo>({
    name: initialPatient?.name || '',
    age: initialPatient?.age || '',
    gender: initialPatient?.gender || 'Male',
    phone: initialPatient?.phone || '',
    history: initialPatient?.history || '',
    vitalsSummary: initialPatient?.vitalsSummary || '',
    bookingRef: initialPatient?.bookingRef || '',
  });

  // Clinical State
  const [chiefComplaints, setChiefComplaints] = useState<string>(
    'Fever with chills for 3 days, dry cough and mild body ache.'
  );
  const [diagnosis, setDiagnosis] = useState<string>(
    'Acute Viral Nasopharyngitis (URTI)'
  );
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>(SAMPLE_MEDICINES);
  const [generalAdvice, setGeneralAdvice] = useState<string>(
    'Adequate hydration (2-3 L fluids/day), warm saline gargles twice daily, light diet. Avoid cold and oily foods.'
  );
  const [followUp, setFollowUp] = useState<string>('After 5 days or SOS');

  // Doctor State
  const [doctor, setDoctor] = useState<DoctorInfo>(DEFAULT_DOCTOR_INFO);

  // Auto-fetch profile logic on mount
  useEffect(() => {
    if (initialPatient && initialPatient.name) {
      setPatient((prev) => ({ ...prev, ...initialPatient }));
      setAutoFetchedSource('Booking / Patient Record');
    } else if (profile && profile.name) {
      handleAutoFetch();
    }
  }, [profile, initialPatient]);

  const handleAutoFetch = () => {
    setIsAutoFetching(true);
    setTimeout(() => {
      const activeName = activeFamilyMember?.name || profile?.name || 'Ramesh Kumar Verma';
      const activeAge = profile?.age || '58';
      const activeGender = profile?.gender || 'Male';
      const activePhone = profile?.phone || '+91 98765 43210';

      const latestVital = vitals?.[0];
      const vitalsText = latestVital
        ? `BP: ${latestVital.bp} mmHg · HR: ${latestVital.hr} bpm · SpO2: ${latestVital.spo2}% · Temp: ${latestVital.temp}°F`
        : 'BP: 124/82 mmHg · SpO2: 98% · HR: 74 bpm';

      const defaultHistory =
        profile?.type === 'Elderly'
          ? 'Hypertension (under medication), Mild GERD, No drug allergies'
          : 'Nil chronic illness, No known drug allergy';

      setPatient((prev) => ({
        ...prev,
        name: prev.name || activeName,
        age: prev.age || activeAge,
        gender: prev.gender || activeGender,
        phone: prev.phone || activePhone,
        history: prev.history || defaultHistory,
        vitalsSummary: prev.vitalsSummary || vitalsText,
      }));

      setAutoFetchedSource(profile?.name ? 'Patient Profile' : 'AayuMarg Vault');
      setIsAutoFetching(false);
    }, 300);
  };

  // Compile full prescription data
  const prescriptionData: PrescriptionData = {
    id: prescriptionId,
    date: todayDate,
    patient,
    chiefComplaints,
    diagnosis,
    medicines,
    generalAdvice,
    nextFollowUp: followUp,
    doctor,
  };

  // Save to DB (doctor only)
  const handleSave = async () => {
    if (!isDoctor) return;
    if (!patientEmail || !patientEmail.includes('@')) {
      setSaveMsg({ type: 'err', text: 'Enter a valid patient email to link this prescription.' });
      return;
    }
    setIsSaving(true);
    setSaveMsg(null);
    try {
      await savePrescription(prescriptionData, patientEmail);
      setSaveMsg({ type: 'ok', text: `Prescription saved and linked to ${patientEmail}.` });
      onSaved?.(prescriptionData);
    } catch (e) {
      setSaveMsg({ type: 'err', text: (e as Error).message || 'Could not save prescription.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    const cleanPatientName = (patient.name || 'Patient').replace(/\s+/g, '_');
    const cleanDate = todayDate.replace(/\s+/g, '-');
    document.title = `Prescription_${cleanPatientName}_${cleanDate}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const handleReset = () => {
    const confirmed = window.confirm('Reset this prescription to start a new blank one?');
    if (!confirmed) return;
    setPatient({ name: '', age: '', gender: 'Male', phone: '', history: '', vitalsSummary: '' });
    setChiefComplaints('');
    setDiagnosis('');
    setMedicines([]);
    setGeneralAdvice('');
    setFollowUp('');
    setPatientEmail('');
    setAutoFetchedSource(null);
    setSaveMsg(null);
  };

  const handleShareWhatsApp = () => {
    if (!patient.phone) { alert('Please enter patient phone number first.'); return; }
    const cleanPhone = patient.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const medLines = medicines
      .map((m, i) => `${i + 1}. *${m.form}. ${m.name} ${m.strength}*\n   Dosage: ${m.dosageFrequency} (${m.timing}) for ${m.duration}`)
      .join('\n');

    const message = `*AayuMarg Digital Prescription*\n` +
      `Date: ${todayDate}\nRx Ref: ${prescriptionId}\n` +
      `Doctor: ${doctor.name} (${doctor.regNumber})\n` +
      `Patient: ${patient.name || 'Patient'} (${patient.age || '-'} Y / ${patient.gender})\n\n` +
      `*Chief Complaints:* ${chiefComplaints || 'Under evaluation'}\n` +
      (diagnosis ? `*Diagnosis:* ${diagnosis}\n\n` : '\n') +
      `*Prescribed Medicines (Rx):*\n${medLines || 'None'}\n\n` +
      (generalAdvice ? `*Advice:* ${generalAdvice}\n` : '') +
      (followUp ? `*Follow Up:* ${followUp}\n\n` : '\n') +
      `_AayuMarg Healthcare • www.aayumarg.com_`;

    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // ── Patient-only view: list their prescriptions ──
  if (!isDoctor) {
    return (
      <div className="rx-generator-root">
        <div
          className="card"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--primary-soft)',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            padding: '14px 20px', marginBottom: 20,
          }}
        >
          <Lock size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 14 }}>
              Prescription view — read only
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              Prescriptions are written by your doctor and automatically appear here once issued.
            </div>
          </div>
        </div>

        {rxStatus === 'loading' && (
          <div className="card muted" style={{ padding: '24px 20px', textAlign: 'center' }}>Loading your prescriptions…</div>
        )}

        {rxStatus === 'success' && prescriptions.length === 0 && (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: 10 }} />
            <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>No prescriptions yet</h4>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Your doctor will issue a digital prescription after your consultation. It will appear here automatically.
            </p>
          </div>
        )}

        {rxStatus === 'success' && prescriptions.length > 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            {prescriptions.map((rx) => (
              <div key={rx.rxRef || rx.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>Prescription — {rx.date}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      Ref: {rx.rxRef || rx.id} · Dr. {rx.doctor?.name || 'AayuMarg Doctor'}
                    </div>
                  </div>
                  <span className="pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700 }}>
                    {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {rx.diagnosis && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <b>Diagnosis:</b> {rx.diagnosis}
                  </div>
                )}

                {rx.medicines && rx.medicines.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medicines (Rx)</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {rx.medicines.map((m, i) => (
                        <div key={m.id || i} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 800, minWidth: 18 }}>{i + 1}.</span>
                          <span>
                            <b>{m.form}. {m.name} {m.strength}</b> —{' '}
                            {m.dosageFrequency} ({m.timing}) for {m.duration}
                            {m.instructions && <span className="muted"> · {m.instructions}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rx.generalAdvice && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                    <b>Advice:</b> {rx.generalAdvice}
                  </div>
                )}
                {rx.nextFollowUp && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    <b>Follow-up:</b> {rx.nextFollowUp}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Doctor editor view ──
  return (
    <div className="rx-generator-root">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print rx-top-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="eyebrow" style={{ margin: 0 }}>Clinical Workspace</div>
          <span className="pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 800 }}>
            {prescriptionId}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'inline-flex', background: 'var(--card-soft)', border: '1px solid var(--line)', borderRadius: 10, padding: 3 }}>
            <button type="button" className={`rx-mode-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
              <Edit3 size={14} /> Editor
            </button>
            <button type="button" className={`rx-mode-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
              <Eye size={14} /> A4 Print Preview
            </button>
          </div>

          <button type="button" className="btn btn-secondary" onClick={handleReset}
            style={{ padding: '8px 12px', fontSize: 12 }} title="Reset to blank prescription">
            <RotateCcw size={14} /> Reset
          </button>

          <button type="button" className="btn btn-secondary" onClick={handleShareWhatsApp}
            style={{ padding: '8px 12px', fontSize: 12, color: '#128c7e' }}
            title="Send prescription summary to patient via WhatsApp">
            <MessageCircle size={14} /> WhatsApp Rx
          </button>

          <button type="button" className="btn btn-primary rx-export-pdf-btn" onClick={handleExportPDF}
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 850 }}>
            <Printer size={16} /> Export to PDF
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rx-generator-layout">
        {/* Editor View */}
        <div className={`rx-editor-pane ${activeTab === 'preview' ? 'hidden-on-mobile' : ''}`}>
          {/* 1. Patient Info */}
          <PatientInfoCard
            patient={patient}
            onChange={setPatient}
            onAutoFetch={handleAutoFetch}
            isAutoFetching={isAutoFetching}
            autoFetchedFrom={autoFetchedSource}
          />

          {/* Patient Email for Linking */}
          <div className="card rx-section-card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="rx-patient-email" style={{ fontWeight: 800 }}>
                Patient Email (required to link prescription to their account)
              </label>
              <input
                id="rx-patient-email"
                type="email"
                placeholder="patient@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                style={{ maxWidth: 380 }}
              />
              <small className="muted">The prescription will appear in this patient's dashboard under "My Prescriptions".</small>
            </div>
          </div>

          {/* 2. Chief Complaints */}
          <ChiefComplaints
            complaints={chiefComplaints}
            onChange={setChiefComplaints}
            diagnosis={diagnosis}
            onDiagnosisChange={setDiagnosis}
          />

          {/* 3. Rx Builder */}
          <RxBuilder
            medicines={medicines}
            onChange={setMedicines}
            generalAdvice={generalAdvice}
            onGeneralAdviceChange={setGeneralAdvice}
            followUp={followUp}
            onFollowUpChange={setFollowUp}
          />

          {/* 4. Footer: Doctor Signature, Seal & Registration */}
          <PrescriptionFooter doctor={doctor} onChange={setDoctor} issuedDate={todayDate} />

          {/* Bottom Export / Save Actions */}
          <div
            className="card"
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 12, padding: '16px 20px',
              background: 'var(--primary-soft)',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 15 }}>
                Prescription Ready for Issuance
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Save to link to patient · or export as PDF.
              </div>
              {saveMsg && (
                <div
                  role="alert"
                  style={{
                    marginTop: 6, fontSize: 12, fontWeight: 700,
                    color: saveMsg.type === 'ok' ? 'var(--green, #1a7a4a)' : 'var(--error, #b3261e)',
                  }}
                >
                  {saveMsg.type === 'ok' ? '✓ ' : '✕ '}{saveMsg.text}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('preview')}>
                <Eye size={15} /> Preview Sheet
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSave}
                disabled={isSaving}
                title="Save to patient's account"
              >
                <Save size={15} /> {isSaving ? 'Saving…' : 'Save to Patient'}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleExportPDF}>
                <Printer size={15} /> Export to PDF
              </button>
            </div>
          </div>
        </div>

        {/* Live A4 Preview Pane */}
        <div className={`rx-preview-pane ${activeTab === 'editor' ? 'hidden-on-mobile' : ''}`}>
          <div className="no-print rx-preview-header" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live A4 Prescription Preview
            </span>
            <button type="button" className="btn btn-primary" onClick={handleExportPDF}
              style={{ padding: '6px 12px', fontSize: 12 }}>
              <Download size={13} /> Save PDF
            </button>
          </div>

          <div className="rx-preview-scroll-wrapper">
            <PrescriptionDocument data={prescriptionData} printableRef={printRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
