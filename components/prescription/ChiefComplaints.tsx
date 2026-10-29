'use client';

import React from 'react';
import { Activity, Plus, Stethoscope } from 'lucide-react';
import { COMMON_SYMPTOMS } from '@/lib/data/medicines';

interface ChiefComplaintsProps {
  complaints: string;
  onChange: (value: string) => void;
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
}

export default function ChiefComplaints({
  complaints,
  onChange,
  diagnosis,
  onDiagnosisChange,
}: ChiefComplaintsProps) {
  const addSymptom = (symptom: string) => {
    if (!complaints.trim()) {
      onChange(symptom);
    } else if (!complaints.toLowerCase().includes(symptom.toLowerCase())) {
      onChange(`${complaints}, ${symptom}`);
    }
  };

  return (
    <div className="card rx-section-card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div className="rx-badge-icon" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
          <Activity size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>2. Chief Complaints &amp; Symptoms</h3>
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
            Current clinical symptoms, duration, and provisional diagnosis
          </p>
        </div>
      </div>

      {/* Quick symptom adder chips */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
          Quick Add Common Symptoms:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {COMMON_SYMPTOMS.slice(0, 10).map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => addSymptom(symptom)}
              className="rx-chip-btn"
            >
              <Plus size={11} /> {symptom}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        {/* Symptoms Text Field */}
        <div className="field">
          <label htmlFor="rx-complaints">Chief Complaints / Presenting Symptoms *</label>
          <textarea
            id="rx-complaints"
            rows={3}
            placeholder="e.g. High grade fever with chills for 3 days, dry hacking cough, sore throat, generalized fatigue..."
            value={complaints}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight: 85 }}
          />
        </div>

        {/* Provisional Diagnosis */}
        <div className="field">
          <label htmlFor="rx-diagnosis" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stethoscope size={13} style={{ color: 'var(--primary)' }} />
            Provisional / Clinical Diagnosis
          </label>
          <textarea
            id="rx-diagnosis"
            rows={3}
            placeholder="e.g. Acute Viral Nasopharyngitis / URTI with mild pharyngitis. Rule out dengue if fever persists."
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            style={{ minHeight: 85 }}
          />
        </div>
      </div>
    </div>
  );
}

