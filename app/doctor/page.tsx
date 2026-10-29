'use client'
import Link from 'next/link'
import AppNav from '../../components/AppNav'
import Footer from '../../components/Footer'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { apiRequest } from '../../lib/api/client'
import { API_ENDPOINTS } from '../../lib/api/endpoints'
import { ApiError } from '../../lib/api/errors'
import { ENV } from '../../lib/config/env'
import { useResource } from '../../lib/hooks/useResource'
import type { DoctorBooking } from '../../lib/types'
import { CheckCircle2, MessageCircle, RefreshCw, Search, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'

const load = () => apiRequest<DoctorBooking[]>(API_ENDPOINTS.doctor.bookings)

type Tab = 'action' | 'unpaid' | 'confirmed' | 'all'
const TABS: [Tab, string][] = [['action', 'Needs action'], ['unpaid', 'Unpaid'], ['confirmed', 'Confirmed'], ['all', 'All']]

const waLink = (n: string) => {
  const d = n.replace(/\D/g, '')
  const full = d.length === 10 ? `91${d}` : d
  return full.length >= 11 ? `https://wa.me/${full}` : null
}
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
const label = (b: DoctorBooking) =>
  b.paymentStatus === 'paid' ? 'Confirmed' : b.paymentStatus === 'submitted' ? 'Payment to verify' : 'Unpaid'

export default function Page() {
  const { data, status, error, reload } = useResource<DoctorBooking[]>(load, [])
  const [tab, setTab] = useState<Tab>('action')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [actionErr, setActionErr] = useState<string | null>(null)

  const forbidden = status === 'error' && /only for doctors|permission/i.test(error ?? '')

  const counts = useMemo(() => ({
    action: data.filter(b => b.paymentStatus === 'submitted').length,
    unpaid: data.filter(b => b.paymentStatus === 'unpaid').length,
    confirmed: data.filter(b => b.paymentStatus === 'paid').length,
    all: data.length,
  }), [data])

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    return data.filter(b => {
      if (tab === 'action' && b.paymentStatus !== 'submitted') return false
      if (tab === 'unpaid' && b.paymentStatus !== 'unpaid') return false
      if (tab === 'confirmed' && b.paymentStatus !== 'paid') return false
      if (!t) return true
      return [b.ref, b.patientName, b.accountName, b.whatsapp, b.profilePhone, b.utr].some(v => v.toLowerCase().includes(t))
    })
  }, [data, tab, q])

  async function confirm(b: DoctorBooking) {
    const ok = window.confirm(
      `Confirm ONLY if you have seen ₹${b.amount} (UTR ${b.utr || 'n/a'}) in your GPay.\n\nConfirm payment for ${b.ref}?`)
    if (!ok) return
    setBusy(b.id); setActionErr(null); setMsg(null)
    try {
      await apiRequest(API_ENDPOINTS.doctor.confirm, { method: 'POST', body: { bookingId: b.id } })
      setMsg(`${b.ref} confirmed.`)
      await reload()
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Could not confirm. Please try again.')
    } finally { setBusy(null) }
  }

  return (
    <>
      <AppNav />
      <main className="main">
        <div className="eyebrow">Doctor panel</div>
        <h1 className="h1">Bookings &amp; patients</h1>
        <p className="sub">All patient bookings in one place. Confirm a payment only after you have seen it in your GPay.</p>

        {ENV.USE_MOCKS && (
          <div className="error-state" role="alert" style={{ marginTop: 16 }}>
            The doctor panel needs the real backend. Set NEXT_PUBLIC_USE_MOCKS=false.
          </div>
        )}

        {forbidden ? (
          <div className="card" style={{ marginTop: 24 }}>
            <b>This area is only for doctors.</b>
            <p className="muted">If you are the doctor, ask the admin to give your account the “doctor” role.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, alignItems: 'center' }}>
              {TABS.map(([id, name]) => (
                <button key={id} type="button" className={`btn ${tab === id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(id)}>
                  {name} ({counts[id]})
                </button>
              ))}
              <button type="button" className="btn btn-secondary" onClick={reload} aria-label="Refresh"><RefreshCw size={15} /> Refresh</button>
              <Link href="/prescription" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                <FileText size={15} /> Write Prescription
              </Link>
            </div>

            <div className="field" style={{ marginTop: 14, maxWidth: 420 }}>
              <label htmlFor="d-search"><Search size={14} style={{ verticalAlign: '-2px' }} /> Search</label>
              <input id="d-search" value={q} maxLength={60} placeholder="Name, ref (AM-…), phone or UTR" onChange={e => setQ(e.target.value)} />
            </div>

            {actionErr && <div className="error-state" role="alert" style={{ marginTop: 14 }}>{actionErr}</div>}
            {msg && <div className="toast" role="status">{msg}</div>}

            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {status === 'loading' && <div className="card"><LoadingState rows={4} /></div>}
              {status === 'error' && !forbidden && <ErrorState message={error ?? 'Could not load bookings.'} onRetry={reload} />}
              {status === 'success' && !shown.length && <EmptyState>No bookings in this view.</EmptyState>}
              {status === 'success' && shown.map(b => {
                const wa = waLink(b.whatsapp)
                return (
                  <div className="card" key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <b>{b.patientName}</b>
                        {b.accountName && b.accountName !== b.patientName && <span className="muted"> (account: {b.accountName})</span>}
                        <div className="muted">
                          {[b.age && `${b.age} yrs`, b.gender, b.city].filter(Boolean).join(' · ') || 'Profile not filled'}
                        </div>
                      </div>
                      <span className="pill">{label(b)}</span>
                    </div>

                    <div className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
                      Ref: <b>{b.ref}</b> · Booked {when(b.createdAt)}<br />
                      Service: {b.confidential ? 'Confidential consultation' : b.service}<br />
                      Slot: <b>{b.date} at {b.time}</b><br />
                      Fee: ₹{b.amount}{b.utr ? <> · UTR: <b>{b.utr}</b></> : null}<br />
                      WhatsApp: <b>{b.whatsapp || 'not provided'}</b>
                      {b.profilePhone && <> · Profile phone: {b.profilePhone}</>}
                      {b.reason && <><br />Reason: {b.reason}</>}
                      {b.attachments.length > 0 && <><br />Files: {b.attachments.join(', ')}</>}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                      <Link
                        className="btn btn-primary"
                        href={`/prescription?patientName=${encodeURIComponent(b.patientName)}&age=${encodeURIComponent(b.age || '')}&gender=${encodeURIComponent(b.gender || '')}&phone=${encodeURIComponent(b.whatsapp || b.profilePhone || '')}&history=${encodeURIComponent(b.reason || '')}&ref=${encodeURIComponent(b.ref)}`}
                      >
                        <FileText size={15} /> Write Prescription
                      </Link>
                      {wa && (
                        <a className="btn btn-secondary" href={wa} target="_blank" rel="noopener noreferrer">
                          <MessageCircle size={15} /> WhatsApp patient
                        </a>
                      )}
                      {b.paymentStatus === 'submitted' && (
                        <button className="btn btn-primary" disabled={busy === b.id} onClick={() => confirm(b)}>
                          <CheckCircle2 size={15} /> {busy === b.id ? 'Confirming…' : 'Confirm payment received'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
        <Footer />
      </main>
    </>
  )
}
