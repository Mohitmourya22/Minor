'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import Footer from '@/components/Footer';
import PrescriptionGenerator from '@/components/prescription/PrescriptionGenerator';
import { LoadingState } from '@/components/States';

function PrescriptionContent() {
  const searchParams = useSearchParams();

  const patientName = searchParams.get('patientName') || '';
  const age = searchParams.get('age') || '';
  const gender = searchParams.get('gender') || '';
  const phone = searchParams.get('phone') || '';
  const history = searchParams.get('history') || '';
  const bookingRef = searchParams.get('ref') || '';

  const initialPatient = {
    name: patientName,
    age,
    gender: gender || 'Male',
    phone,
    history,
    bookingRef,
  };

  return <PrescriptionGenerator initialPatient={initialPatient} />;
}

export default function PrescriptionPage() {
  return (
    <>
      <AppNav />
      <main className="main rx-page-main">
        <div className="no-print">
          <div className="eyebrow">AayuMarg Clinical Tools</div>
          <h1 className="h1">Digital Prescription Generator</h1>
          <p className="sub">
            Generate compliant electronic medical prescriptions with auto-fetched patient records,
            bilingual English &amp; Hindi dosage schedules, verified clinical seal, and instant PDF export.
          </p>
        </div>

        <div style={{ marginTop: 20 }}>
          <Suspense fallback={<div className="card"><LoadingState rows={4} /></div>}>
            <PrescriptionContent />
          </Suspense>
        </div>

        <div className="no-print" style={{ marginTop: 40 }}>
          <Footer />
        </div>
      </main>
    </>
  );
}

