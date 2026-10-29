'use client';
import Image from 'next/image';
import React from 'react';
import { DoctorInfo } from '@/lib/types/prescription';
import { FileSignature } from 'lucide-react';

interface PrescriptionFooterProps {
  doctor: DoctorInfo;
  onChange: (updated: DoctorInfo) => void;
  issuedDate: string;
}

export default function PrescriptionFooter({
  doctor,
  onChange,
  issuedDate,
}: PrescriptionFooterProps) {
  const update = (field: keyof DoctorInfo, value: string) => {
    onChange({ ...doctor, [field]: value });
  };

  return (
    <div className="card rx-section-card" style={{ marginBottom: 20 }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div className="rx-badge-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
          <FileSignature size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>4. Doctor Verification &amp; Seal</h3>
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
            Doctor credentials and official clinical seal
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, alignItems: 'center' }}>

        {/* Editable Doctor Credentials */}
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label htmlFor="doc-name">Doctor Name *</label>
              <input
                id="doc-name"
                type="text"
                value={doctor.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="doc-reg">Medical Reg. Number *</label>
              <input
                id="doc-reg"
                type="text"
                placeholder="e.g. CGMC 14529/2024"
                value={doctor.regNumber}
                onChange={(e) => update('regNumber', e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label htmlFor="doc-qual">Qualifications</label>
              <input
                id="doc-qual"
                type="text"
                value={doctor.qualifications}
                onChange={(e) => update('qualifications', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="doc-dept">Department / Specialty</label>
              <input
                id="doc-dept"
                type="text"
                value={doctor.department}
                onChange={(e) => update('department', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Official Stamp Preview — only the real seal, no duplicate text */}
        <div
          style={{
            background: 'var(--card-soft)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Image
            src="/stamps/stamp.png"
            alt="Dr. Shikhar Chepe Official Seal"
            width={140}
            height={140}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>
            Official Seal · Issued: {issuedDate}
          </div>
        </div>

      </div>
    </div>
  );
}
