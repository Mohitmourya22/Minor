'use client'
import AppNav from '../../components/AppNav'
import Footer from '../../components/Footer'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { useVitals } from '../../lib/hooks/useVitals'
import { HeartPulse, Save, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Vital } from '../../lib/types'
import { LIMITS, validateVital, type VitalErrors } from '../../lib/validation/vitals'
import { todayIst } from '../../lib/validation/booking'

const today = () => todayIst()
const yearAgo = () => { const d = new Date(`${todayIst()}T00:00:00Z`); d.setUTCFullYear(d.getUTCFullYear() - 1); return d.toISOString().slice(0, 10) }

/** Typing filters: only digits (and one decimal point / one slash where it makes sense). */
const whole = (v: string) => v.replace(/\D/g, '').slice(0, 3)
const decimal = (v: string) => {
  const c = v.replace(/[^\d.]/g, '')
  const [a, ...rest] = c.split('.')
  return (rest.length ? `${a.slice(0, 3)}.${rest.join('').slice(0, 1)}` : a.slice(0, 3))
}
const bpFilter = (v: string) => {
  const c = v.replace(/[^\d/]/g, '')
  const [a, ...rest] = c.split('/')
  return rest.length ? `${a.slice(0, 3)}/${rest.join('').replace(/\//g, '').slice(0, 3)}` : a.slice(0, 3)
}

export default function Page() {
  const { vitals, status, error, reload, add, saving, saveError } = useVitals()
  const [form, setForm] = useState<Vital>({
    date: today(), bp: '120/80', hr: '72', spo2: '98', temp: '98.6', sugar: '95', weight: '65',
  })
  const [saved, setSaved] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errs: VitalErrors = validateVital(form, today())
  const show = (k: keyof Vital) => (touched[k] || touched.__all ? errs[k] : undefined)
  const blur = (k: string) => setTouched(t => ({ ...t, [k]: true }))
  const Err = ({ k }: { k: keyof Vital }) => show(k) ? <small role="alert" style={{ color: 'var(--error, #b3261e)' }}>{show(k)}</small> : null

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 1800)
    return () => clearTimeout(t)
  }, [saved])

  const u = (k: keyof Vital, v: string) => setForm({ ...form, [k]: v })
  const save = async () => {
    setTouched({ __all: true })
    if (Object.keys(validateVital(form, today())).length) return
    const clean: Vital = { ...form, bp: form.bp.replace(/\s/g, ''), hr: form.hr.trim(), spo2: form.spo2.trim(), temp: form.temp.trim(), sugar: form.sugar.trim(), weight: form.weight.trim() }
    if (await add(clean)) setSaved(true)
  }

  return (
    <>
      <AppNav />
      <main className="main">
        <div className="eyebrow">Health snapshot</div>
        <h1 className="h1">Vitals Vault</h1>
        <p className="sub">
          Enter a quick set of vitals and keep the latest values visible.
          This is not a medical decision tool.
        </p>

        <div className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="icon-box"><HeartPulse size={20} /></div>
            <div className="section-head"><h2>New reading</h2></div>
            <div className="form">
              <div className="field">
                <label htmlFor="v-date">Date</label>
                <input id="v-date" type="date" value={form.date} min={yearAgo()} max={today()} onChange={e => u('date', e.target.value)} onBlur={() => blur('date')} />
                <Err k="date" />
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="v-bp">Blood pressure (mmHg)</label>
                  <input id="v-bp" inputMode="numeric" value={form.bp} onChange={e => u('bp', bpFilter(e.target.value))} onBlur={() => blur('bp')} placeholder="120/80" aria-invalid={!!show('bp')} />
                  <Err k="bp" />
                </div>
                <div className="field">
                  <label htmlFor="v-hr">Heart rate (bpm)</label>
                  <input id="v-hr" inputMode="numeric" value={form.hr} onChange={e => u('hr', whole(e.target.value))} onBlur={() => blur('hr')} placeholder="72" aria-invalid={!!show('hr')} />
                  <Err k="hr" />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="v-spo2">SpO₂ (%)</label>
                  <input id="v-spo2" inputMode="numeric" value={form.spo2} onChange={e => u('spo2', whole(e.target.value))} onBlur={() => blur('spo2')} placeholder="98" aria-invalid={!!show('spo2')} />
                  <Err k="spo2" />
                </div>
                <div className="field">
                  <label htmlFor="v-temp">Temperature (°F)</label>
                  <input id="v-temp" inputMode="decimal" value={form.temp} onChange={e => u('temp', decimal(e.target.value))} onBlur={() => blur('temp')} placeholder="98.6" aria-invalid={!!show('temp')} />
                  <Err k="temp" />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="v-sugar">Blood sugar (mg/dL)</label>
                  <input id="v-sugar" inputMode="decimal" value={form.sugar} onChange={e => u('sugar', decimal(e.target.value))} onBlur={() => blur('sugar')} placeholder="95" aria-invalid={!!show('sugar')} />
                  <Err k="sugar" />
                </div>
                <div className="field">
                  <label htmlFor="v-weight">Weight (kg)</label>
                  <input id="v-weight" inputMode="decimal" value={form.weight} onChange={e => u('weight', decimal(e.target.value))} onBlur={() => blur('weight')} placeholder="65" aria-invalid={!!show('weight')} />
                  <Err k="weight" />
                </div>
              </div>
              <small className="muted">
                Allowed: BP {LIMITS.sys.min}–{LIMITS.sys.max}/{LIMITS.dia.min}–{LIMITS.dia.max} · HR {LIMITS.hr.min}–{LIMITS.hr.max} · SpO₂ {LIMITS.spo2.min}–{LIMITS.spo2.max}% · Temp {LIMITS.temp.min}–{LIMITS.temp.max}°F · Sugar {LIMITS.sugar.min}–{LIMITS.sugar.max} · Weight {LIMITS.weight.min}–{LIMITS.weight.max} kg
              </small>
              {saveError && <div className="error-state" role="alert">{saveError}</div>}
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                <Save size={17} />
                {saving ? 'Saving…' : 'Save reading'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Latest vitals</div>
            <div className="muted" style={{ margin: '4px 0 14px' }}>Most recent readings first</div>
            {status === 'loading' && <LoadingState rows={4} />}
            {status === 'error' && <ErrorState message={error ?? 'Could not load your vitals.'} onRetry={reload} />}
            {status === 'success' && (vitals.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Date</th><th>BP</th><th>HR</th><th>SpO₂</th></tr>
                  </thead>
                  <tbody>
                    {vitals.map((r, i) => (
                      <tr key={r.id ?? `${r.date}-${i}`}>
                        <td>{r.date}</td><td>{r.bp}</td><td>{r.hr}</td><td>{r.spo2}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No readings yet. Save your first set on the left.</EmptyState>
            ))}
          </div>
        </div>

        {saved && <div className="toast" role="status">Vitals saved.</div>}

        <div className="card" style={{ marginTop: 18, background: 'var(--gold-soft)' }}>
          <b><Plus size={16} style={{ verticalAlign: '-3px' }} /> Note:</b>
          <span className="muted"> trends, timestamps and alerts will be added once the backend is connected.</span>
        </div>
        <Footer />
      </main>
    </>
  )
}
