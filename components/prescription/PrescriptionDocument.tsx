'use client';

import React from 'react';
import Image from 'next/image';
import { PrescriptionData } from '@/lib/types/prescription';
import { DOSAGE_FREQUENCIES } from '@/lib/data/medicines';

interface PrescriptionDocumentProps {
  data: PrescriptionData;
  printableRef?: React.RefObject<HTMLDivElement | null>;
}

export default function PrescriptionDocument({
  data,
  printableRef,
}: PrescriptionDocumentProps) {
  const {
    id,
    date,
    patient,
    chiefComplaints,
    diagnosis,
    medicines,
    generalAdvice,
    nextFollowUp,
    doctor,
  } = data;

  return (
    <div
      ref={printableRef}
      id="prescription-printable-area"
      className="prescription-sheet"
      style={{
        background: '#ffffff',
        color: '#1a1a1a',
        maxWidth: 820,
        margin: '0 auto',
        padding: '36px 42px',
        borderRadius: 8,
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: 'relative',
        lineHeight: 1.5,
      }}
    >
      {/* ================= CLINIC & DOCTOR HEADER ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2.5px solid #7a1f2b',
          paddingBottom: 16,
          marginBottom: 16,
        }}
      >
        {/* Left: Clinic Branding */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: '#7a1f2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              ✚
            </div>
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#7a1f2b',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                AayuMarg
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#b7791f',
                }}
              >
                WE CARE
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 8, lineHeight: 1.4 }}>
            {doctor.clinicName}<br />
            {doctor.address} &bull; Phone: {doctor.phone}<br />
            Email: {doctor.email} &bull; Web: www.aayumarg.com
          </div>
        </div>

        {/* Right: Doctor Credentials */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 850, color: '#1a1a1a' }}>{doctor.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a1f2b' }}>{doctor.qualifications}</div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{doctor.department}</div>
          <div style={{ fontSize: 11, color: '#540202ff', marginTop: 4 }}>Reg. No: {doctor.regNumber}</div>
          {/* WhatsApp contact below Reg. No */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, justifyContent: 'flex-end' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366" style={{ filter: 'drop-shadow(0 0 3px #25D366)' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.549 4.09 1.508 5.814L.057 23.882l6.262-1.442A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.002-1.369l-.358-.214-3.718.856.892-3.623-.234-.373A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" /></svg>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#111111' }}>+919243545455</span>
          </div>
        </div>
      </div>

      {/* ================= PATIENT DEMOGRAPHICS BAR ================= */}
      <div
        style={{
          background: '#fcf8f6',
          border: '1px solid #ebdcd5',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.8fr 1fr 1fr',
            gap: 10,
            fontSize: 12.5,
          }}
        >
          <div>
            <span style={{ color: '#666', fontSize: 11 }}>Patient Name: </span>
            <strong style={{ fontSize: 14, color: '#111' }}>{patient.name || '–'}</strong>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: 11 }}>Age / Sex: </span>
            <strong>
              {patient.age ? `${patient.age} Yrs` : '–'} / {patient.gender || '–'}
            </strong>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: 11 }}>Contact: </span>
            <strong>{patient.phone || '–'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#666', fontSize: 11 }}>Date: </span>
            <strong>{date}</strong>
          </div>
        </div>

        {/* Secondary Row: Rx ID, Ref, Vitals & Medical History */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            borderTop: '1px dashed #ebdcd5',
            marginTop: 8,
            paddingTop: 8,
            fontSize: 11.5,
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>
              Rx ID: <strong style={{ color: '#7a1f2b' }}>{id}</strong>
            </span>
            {patient.bookingRef && (
              <span>
                Booking Ref: <strong>{patient.bookingRef}</strong>
              </span>
            )}
            {patient.vitalsSummary && (
              <span>
                Vitals: <strong>{patient.vitalsSummary}</strong>
              </span>
            )}
          </div>
          {patient.history && (
            <div style={{ color: '#444' }}>
              <strong>History / Allergies:</strong> {patient.history}
            </div>
          )}
        </div>
      </div>

      {/* ================= CHIEF COMPLAINTS & DIAGNOSIS ================= */}
      {(chiefComplaints || diagnosis) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: diagnosis ? '1.4fr 1.2fr' : '1fr',
            gap: 12,
            marginBottom: 16,
            background: '#fafafa',
            border: '1px solid #ebebeb',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 12,
          }}
        >
          {chiefComplaints && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7a1f2b', textTransform: 'uppercase' }}>
                Chief Complaints &amp; Symptoms
              </div>
              <div style={{ color: '#222', marginTop: 2, whiteSpace: 'pre-line' }}>{chiefComplaints}</div>
            </div>
          )}
          {diagnosis && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7a1f2b', textTransform: 'uppercase' }}>
                Clinical Diagnosis
              </div>
              <div style={{ color: '#222', marginTop: 2, fontWeight: 650 }}>{diagnosis}</div>
            </div>
          )}
        </div>
      )}

      {/* ================= RX SYMBOL & MEDICATION TABLE ================= */}
      <div style={{ marginBottom: 20 }}>
        {/* Rx Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: 32,
              fontWeight: 'bold',
              fontStyle: 'italic',
              color: '#7a1f2b',
              lineHeight: 1,
            }}
          >
            ℞
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: '#666' }}>
            MEDICATION ORDER (RX)
          </span>
        </div>

        {/* Medicines Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ background: '#7a1f2b', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: '32px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '8px 10px' }}>Medicine Name &amp; Strength</th>
              <th style={{ padding: '8px 10px' }}>Dosage &amp; Frequency (Hindi / English)</th>
              <th style={{ padding: '8px 10px' }}>Timing</th>
              <th style={{ padding: '8px 10px' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: 'center', color: '#777' }}>
                  No medication prescribed.
                </td>
              </tr>
            ) : (
              medicines.map((med, idx) => {
                const freq = DOSAGE_FREQUENCIES.find((f) => f.code === med.dosageFrequency);
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={med.id || idx}
                    style={{
                      background: isEven ? '#ffffff' : '#fdfaf9',
                      borderBottom: '1px solid #ebdcd5',
                    }}
                  >
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: '#7a1f2b' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div>
                        <strong style={{ fontSize: 13, color: '#111' }}>
                          {med.form}. {med.name}
                        </strong>
                        {med.strength && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#7a1f2b',
                              background: '#f8e9ea',
                              padding: '1px 5px',
                              borderRadius: 3,
                            }}
                          >
                            {med.strength}
                          </span>
                        )}
                      </div>
                      {med.instructions && (
                        <div style={{ fontSize: 11, color: '#555', marginTop: 3, fontStyle: 'italic' }}>
                          Note: {med.instructions}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontWeight: 850,
                            fontSize: 12.5,
                            color: '#111',
                            background: '#fbf1dc',
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #e7ce9e',
                          }}
                        >
                          {med.dosageFrequency}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: '#444', marginTop: 3, fontWeight: 650 }}>
                        {freq ? `${freq.hindi} · ${freq.english}` : med.dosageLabel}
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#333', fontWeight: 600 }}>{med.timing}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 800, color: '#7a1f2b' }}>{med.duration}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= GENERAL ADVICE & FOLLOW-UP ================= */}
      {(generalAdvice || nextFollowUp) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: nextFollowUp ? '1.5fr 1fr' : '1fr',
            gap: 14,
            marginBottom: 20,
            background: '#fafafa',
            border: '1px solid #e6e6e6',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 11.5,
          }}
        >
          {generalAdvice && (
            <div>
              <div style={{ fontWeight: 800, color: '#7a1f2b', textTransform: 'uppercase', fontSize: 11 }}>
                General Advice &amp; Instructions:
              </div>
              <div style={{ color: '#333', marginTop: 2, whiteSpace: 'pre-line' }}>{generalAdvice}</div>
            </div>
          )}
          {nextFollowUp && (
            <div>
              <div style={{ fontWeight: 800, color: '#7a1f2b', textTransform: 'uppercase', fontSize: 11 }}>
                Next Review / Follow-Up:
              </div>
              <div style={{ color: '#111', fontWeight: 700, marginTop: 2 }}>{nextFollowUp}</div>
            </div>
          )}
        </div>
      )}

      {/* ===== FOOTER: SEAL & REGISTRATION ===== */}
      <div
        style={{
          borderTop: '2px solid #7a1f2b',
          paddingTop: 16,
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pageBreakInside: 'avoid',
        }}
      >
        {/* Left: AayuMarg branding note */}
        <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
          <strong>AayuMarg Digital Prescription</strong><br />
          Verified Medical Practitioner Record<br />
          Generated under NMC / Telemedicine Practice Guidelines
        </div>

        {/* Right: Official stamp + compact digital signature */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <Image
            src="/stamps/stamp.png"
            alt="Dr. Shikhar Chepe Official Seal"
            width={110}
            height={110}
            style={{ objectFit: 'contain', transform: 'rotate(-10deg)' }}
          />
          <div style={{ textAlign: 'right', maxWidth: 150, fontSize: 9.5, color: '#555', fontWeight: 500, lineHeight: 1.45 }}>
            <div style={{ fontStyle: 'italic', color: '#777' }}>Digitally signed by</div>
            <div style={{ fontWeight: 700, color: '#333', fontSize: 10 }}>{doctor.name}</div>
            <div style={{ fontSize: 9, color: '#999' }}>Reg. No: {doctor.regNumber}</div>
          </div>
        </div>
      </div>


      {/* Small Legal Disclaimer */}
      <div
        style={{
          borderTop: '1px solid #ebdcd5',
          marginTop: 14,
          paddingTop: 8,
          fontSize: 9.5,
          color: '#888',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        This digital prescription is valid across pharmacies and diagnostic laboratories in India as per the Telemedicine Practice Guidelines, 2020. Not for medicolegal purposes. In case of medical emergencies, please visit the nearest hospital casualty immediately.
      </div>
    </div>
  );
}

