'use client';

import React, { useState } from 'react';
import { PrescriptionMedicine, MedicineForm } from '@/lib/types/prescription';
import {
  MEDICINE_CATALOG,
  DOSAGE_FREQUENCIES,
  TIMING_OPTIONS,
  DURATION_OPTIONS,
} from '@/lib/data/medicines';
import { Plus, Trash2, Pill, Clock, Calendar } from 'lucide-react';

interface RxBuilderProps {
  medicines: PrescriptionMedicine[];
  onChange: (medicines: PrescriptionMedicine[]) => void;
  generalAdvice: string;
  onGeneralAdviceChange: (advice: string) => void;
  followUp: string;
  onFollowUpChange: (followUp: string) => void;
}

const FORMS: MedicineForm[] = ['Tab', 'Cap', 'Syp', 'Susp', 'Drops', 'Inj', 'Oint', 'Gel', 'Inhaler', 'Sachet'];

export default function RxBuilder({
  medicines,
  onChange,
  generalAdvice,
  onGeneralAdviceChange,
  followUp,
  onFollowUpChange,
}: RxBuilderProps) {
  const addRow = (preset?: Partial<PrescriptionMedicine>) => {
    const defaultFrequency = DOSAGE_FREQUENCIES[0]; // 1-0-1
    const newMedicine: PrescriptionMedicine = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: preset?.name || '',
      strength: preset?.strength || '650 mg',
      form: preset?.form || 'Tab',
      dosageFrequency: preset?.dosageFrequency || defaultFrequency.code,
      dosageLabel: preset?.dosageLabel || defaultFrequency.label,
      timing: preset?.timing || TIMING_OPTIONS[0].value,
      duration: preset?.duration || '5 days',
      instructions: preset?.instructions || '',
    };
    onChange([...medicines, newMedicine]);
  };

  const removeRow = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRow = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };

    // If changing dosage frequency, auto-update the dosageLabel
    if (field === 'dosageFrequency') {
      const match = DOSAGE_FREQUENCIES.find((d) => d.code === value);
      if (match) {
        updated[index].dosageLabel = match.label;
      }
    }

    onChange(updated);
  };

  const handleSelectCatalog = (index: number, selectedValue: string) => {
    const item = MEDICINE_CATALOG.find(
      (m) => `${m.name} [${m.strength}]` === selectedValue || m.name === selectedValue
    );
    if (item) {
      const updated = [...medicines];
      updated[index] = {
        ...updated[index],
        name: item.name,
        strength: item.strength,
        form: item.form,
      };
      onChange(updated);
    }
  };

  return (
    <div className="card rx-section-card" style={{ marginBottom: 20 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="rx-badge-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Pill size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>3. Rx Builder (Medication &amp; Dosage)</h3>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Dynamic medication regimen with bilingual Hindi/English dosage guides
            </p>
          </div>
        </div>


      </div>

      {/* Datalist for Medicine Search Autocomplete */}
      <datalist id="rx-medicine-suggestions">
        {MEDICINE_CATALOG.map((m, idx) => (
          <option key={idx} value={`${m.name} (${m.strength})`}>
            {m.category} · {m.form}
          </option>
        ))}
      </datalist>

      {/* Medication Rows */}
      {medicines.length === 0 ? (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 'var(--radius)',
            padding: '32px 20px',
            textAlign: 'center',
            background: 'var(--card-soft)',
            margin: '12px 0',
          }}
        >
          <Pill size={32} style={{ color: 'var(--primary)', opacity: 0.7, marginBottom: 8 }} />
          <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>No medications added yet</h4>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
            Click &ldquo;+ Add Medicine&rdquo; to build prescription rows with frequency, timing, and duration.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => addRow()}>
            <Plus size={15} /> Add First Medicine
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {medicines.map((med, index) => {
            const currentFrequency = DOSAGE_FREQUENCIES.find((f) => f.code === med.dosageFrequency);

            return (
              <div
                key={med.id || index}
                className="rx-row-card"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                {/* Row Header with index and remove button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--ink)' }}>
                      Medicine Item #{index + 1}
                    </span>
                    {currentFrequency && (
                      <span
                        className="pill"
                        style={{
                          background: 'var(--gold-soft)',
                          color: 'var(--gold)',
                          border: '1px solid color-mix(in srgb, var(--gold) 20%, transparent)',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {currentFrequency.code} · {currentFrequency.hindi}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label={`Remove medicine ${index + 1}`}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    title="Remove this medicine"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>

                {/* Main 4 Fields Grid: Search/Name, Dosage Frequency, Timing, Duration */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1.4fr 1.2fr 0.9fr',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* 1. Medicine Name & Strength search dropdown */}
                  <div className="field">
                    <label htmlFor={`med-name-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Pill size={12} style={{ color: 'var(--primary)' }} />
                      Medicine Name &amp; Strength *
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        style={{ width: '85px', padding: '10px 6px', fontSize: 12 }}
                        value={med.form}
                        onChange={(e) => updateRow(index, 'form', e.target.value as MedicineForm)}
                      >
                        {FORMS.map((f) => (
                          <option key={f} value={f}>
                            {f}.
                          </option>
                        ))}
                      </select>
                      <input
                        id={`med-name-${index}`}
                        type="text"
                        list="rx-medicine-suggestions"
                        placeholder="Search medicine or type name (e.g. Dolo 650)"
                        value={med.name}
                        onChange={(e) => updateRow(index, 'name', e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {/* Quick catalog select dropdown helper */}
                    <div style={{ marginTop: 4 }}>
                      <select
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          color: 'var(--muted)',
                          background: 'var(--card-soft)',
                          border: '1px dashed var(--line)',
                          borderRadius: 6,
                          width: '100%',
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectCatalog(index, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">⚡ Or pick from clinical catalog...</option>
                        {MEDICINE_CATALOG.map((m, idx) => (
                          <option key={idx} value={`${m.name} [${m.strength}]`}>
                            {m.form}. {m.name} ({m.strength}) — {m.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. Dosage Frequency Dropdown with Hindi/English labels */}
                  <div className="field">
                    <label htmlFor={`med-freq-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} style={{ color: 'var(--gold)' }} />
                      Dosage Frequency (Hindi &amp; English) *
                    </label>
                    <select
                      id={`med-freq-${index}`}
                      value={med.dosageFrequency}
                      onChange={(e) => updateRow(index, 'dosageFrequency', e.target.value)}
                      style={{ fontWeight: 700 }}
                    >
                      {DOSAGE_FREQUENCIES.map((freq) => (
                        <option key={freq.code} value={freq.code}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                    {currentFrequency && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          marginTop: 3,
                          padding: '2px 6px',
                          background: 'var(--card-soft)',
                          borderRadius: 4,
                        }}
                      >
                        🗣 <b>{currentFrequency.english}</b> &bull; {currentFrequency.hindi}
                      </div>
                    )}
                  </div>

                  {/* 3. Timing Dropdown */}
                  <div className="field">
                    <label htmlFor={`med-timing-${index}`}>Timing *</label>
                    <select
                      id={`med-timing-${index}`}
                      value={med.timing}
                      onChange={(e) => updateRow(index, 'timing', e.target.value)}
                    >
                      {TIMING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Duration */}
                  <div className="field">
                    <label htmlFor={`med-duration-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      Duration *
                    </label>
                    <input
                      id={`med-duration-${index}`}
                      type="text"
                      list={`duration-presets-${index}`}
                      placeholder="e.g. 5 days"
                      value={med.duration}
                      onChange={(e) => updateRow(index, 'duration', e.target.value)}
                    />
                    <datalist id={`duration-presets-${index}`}>
                      {DURATION_OPTIONS.map((dur) => (
                        <option key={dur} value={dur} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Optional Note / Special Instruction for this drug */}
                <div style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="Specific instruction (e.g. Drink warm water, avoid milk for 1 hr, take after breakfast)"
                    value={med.instructions || ''}
                    onChange={(e) => updateRow(index, 'instructions', e.target.value)}
                    style={{
                      fontSize: 12,
                      padding: '7px 10px',
                      background: 'var(--card-soft)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medicine button — bottom of list so new rows append downward */}
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => addRow()}
          style={{ padding: '8px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Advice and Follow-up section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 18 }}>
        <div className="field">
          <label htmlFor="rx-general-advice">General Lifestyle &amp; Dietary Advice</label>
          <textarea
            id="rx-general-advice"
            rows={2}
            placeholder="e.g. Drink adequate fluids (2.5L/day), light home-cooked meals, steam inhalation twice a day, rest."
            value={generalAdvice}
            onChange={(e) => onGeneralAdviceChange(e.target.value)}
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="field">
          <label htmlFor="rx-follow-up">Next Follow-Up / Review Date</label>
          <input
            id="rx-follow-up"
            type="text"
            placeholder="e.g. Review after 5 days or SOS if fever > 101°F"
            value={followUp}
            onChange={(e) => onFollowUpChange(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {['After 3 days', 'After 5 days', 'After 1 week', 'SOS / As needed'].map((pill) => (
              <button
                key={pill}
                type="button"
                className="rx-chip-btn"
                onClick={() => onFollowUpChange(pill)}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

