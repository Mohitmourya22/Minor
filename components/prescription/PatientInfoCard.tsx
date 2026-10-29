'use client';

import React from 'react';
import { PatientInfo } from '@/lib/types/prescription';
import { User, Phone, Sparkles, RefreshCw, HeartPulse, History, AlertCircle } from 'lucide-react';

interface PatientInfoCardProps {
  patient: PatientInfo;
  onChange: (updated: PatientInfo) => void;
  onAutoFetch: () => void;
  isAutoFetching?: boolean;
  autoFetchedFrom?: string | null;
}

export default function PatientInfoCard({
  patient,
  onChange,
  onAutoFetch,
  isAutoFetching = false,
  autoFetchedFrom,
}: PatientInfoCardProps) {
  const update = (field: keyof PatientInfo, value: string) => {
    onChange({ ...patient, [field]: value });
  };

  return (
    <div className="card rx-section-card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="rx-badge-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>1. Patient Information</h3>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                Patient identity, contact, vitals &amp; clinical history
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {autoFetchedFrom && (
            <span
              className="pill"
              style={{
                background: 'var(--blue-soft)',
                color: 'var(--blue)',
                border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)',
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={13} /> Fetched from {autoFetchedFrom}
            </span>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onAutoFetch}
            disabled={isAutoFetching}
            style={{ padding: '7px 12px', fontSize: 12 }}
            title="Auto-fetch patient details from active Profile & Vitals"
          >
            <RefreshCw size={13} className={isAutoFetching ? 'spin' : ''} />
            {isAutoFetching ? 'Fetching…' : 'Auto-fetch Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: 12 }}>
        {/* Name */}
        <div className="field">
          <label htmlFor="p-name">Patient Full Name *</label>
          <div style={{ position: 'relative' }}>
            <input
              id="p-name"
              type="text"
              placeholder="e.g. Ramesh Kumar Verma"
              value={patient.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Age & Gender */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="field">
            <label htmlFor="p-age">Age (Yrs) *</label>
            <input
              id="p-age"
              type="text"
              placeholder="e.g. 58"
              value={patient.age}
              onChange={(e) => update('age', e.target.value)}
              maxLength={4}
            />
          </div>
          <div className="field">
            <label htmlFor="p-gender">Gender *</label>
            <select
              id="p-gender"
              value={patient.gender || 'Male'}
              onChange={(e) => update('gender', e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="field">
          <label htmlFor="p-phone">Phone / WhatsApp *</label>
          <div style={{ position: 'relative' }}>
            <input
              id="p-phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={patient.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Second Row: Medical History & Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginTop: 12 }}>
        <div className="field">
          <label htmlFor="p-history" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <History size={13} style={{ color: 'var(--primary)' }} />
            Medical History, Allergies &amp; Chronic Conditions
          </label>
          <input
            id="p-history"
            type="text"
            placeholder="e.g. Hypertension (5 yrs), Type 2 DM, Penicillin allergy, Nil past surgeries"
            value={patient.history}
            onChange={(e) => update('history', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="p-vitals" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <HeartPulse size={13} style={{ color: 'var(--red)' }} />
            Current Vitals Summary
          </label>
          <input
            id="p-vitals"
            type="text"
            placeholder="e.g. BP: 126/82 mmHg · HR: 76 bpm · SpO2: 98%"
            value={patient.vitalsSummary || ''}
            onChange={(e) => update('vitalsSummary', e.target.value)}
          />
        </div>
      </div>

      {patient.bookingRef && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={12} style={{ color: 'var(--gold)' }} />
          Linked Consultation Ref: <b>{patient.bookingRef}</b>
        </div>
      )}
    </div>
  );
}

