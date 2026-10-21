'use client'
import AppNav from '../../components/AppNav'
import Footer from '../../components/Footer'
import { ErrorState, LoadingState } from '../../components/States'
import { useProfile } from '../../lib/hooks/useProfile'
import { useUser } from '@clerk/nextjs'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Profile } from '../../lib/types'
import { OTHER, STATES, citiesOf, cleanProfile, validateProfile, type ProfileErrors } from '../../lib/validation/profile'
import { GENDERS } from '../../lib/validation/common'

const blank: Profile = {
  name: '', age: '', gender: '', phone: '', emergencyName: '', emergencyPhone: '',
  state: '', city: '', pincode: '', address: '',
  type: 'Elderly', caregiverName: '', caregiverPhone: '',
}

/** Live input filters: the wrong kind of character simply cannot be typed. */
const onlyLetters = (v: string) => v.replace(/[^\p{L}\p{M} ]/gu, '').replace(/ {2,}/g, ' ').slice(0, 50)
const onlyDigits = (max: number) => (v: string) => v.replace(/\D/g, '').slice(0, max)

export default function Page() {
  const { user } = useUser()
  const { profile, status, error, reload, save, saving, saveError } = useProfile()
  const [p, setP] = useState<Profile>(blank)
  const [saved, setSaved] = useState(false)
  const [errs, setErrs] = useState<ProfileErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [cityOther, setCityOther] = useState(false)

  // Fill the form once the profile has loaded (or default the name from Clerk).
  useEffect(() => {
    if (status !== 'success') return
    const base = profile ? { ...blank, ...profile } : { ...blank, name: onlyLetters(user?.fullName || user?.firstName || '') }
    setP(base)
    setCityOther(!!base.state && !!base.city && !citiesOf(base.state).includes(base.city))
  }, [status, profile, user?.fullName, user?.firstName])

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 1800)
    return () => clearTimeout(t)
  }, [saved])

  const update = (k: keyof Profile, v: string) => {
    const next = { ...p, [k]: v }
    setP(next)
    setErrs(validateProfile(next))
  }
  const blur = (k: string) => setTouched(t => ({ ...t, [k]: true }))
  const err = (k: keyof ProfileErrors) => (touched[k] || touched.__all ? errs[k] : undefined)

  const onState = (v: string) => {
    const next = { ...p, state: v, city: '' }
    setCityOther(false)
    setP(next); setErrs(validateProfile(next))
  }
  const onCity = (v: string) => {
    if (v === OTHER) { setCityOther(true); update('city', ''); return }
    setCityOther(false); update('city', v)
  }

  const onSave = async () => {
    const cleaned = cleanProfile(p)
    const found = validateProfile(cleaned)
    setErrs(found)
    setTouched({ __all: true })
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0]
      document.getElementById(`pf-${first}`)?.focus()
      return
    }
    if (await save(cleaned)) setSaved(true)
  }

  const Err = ({ k }: { k: keyof ProfileErrors }) =>
    err(k) ? <small role="alert" style={{ color: 'var(--error, #b3261e)' }}>{err(k)}</small> : null

  return (
    <>
      <AppNav />
      <main className="main">
        <div className="eyebrow">Account &amp; care details</div>
        <h1 className="h1">User registration &amp; profile</h1>
        <p className="sub">
          Keep the essential information simple. Your details are stored securely and are visible only to you
          and the AayuMarg care team.
        </p>

        <div className="card" style={{ marginTop: 24 }}>
          {status === 'loading' && <LoadingState rows={5} />}
          {status === 'error' && <ErrorState message={error ?? 'Could not load your profile.'} onRetry={reload} />}
          {status === 'success' && (
            <div className="form">
              <div className="row">
                <div className="field">
                  <label htmlFor="pf-name">Name</label>
                  <input id="pf-name" value={p.name} maxLength={50} autoComplete="name" placeholder="Full name (letters only)"
                    onChange={e => update('name', onlyLetters(e.target.value))} onBlur={() => blur('name')} aria-invalid={!!err('name')} />
                  <Err k="name" />
                </div>
                <div className="field">
                  <label htmlFor="pf-age">Age</label>
                  <input id="pf-age" inputMode="numeric" value={p.age} maxLength={3} placeholder="1 – 150"
                    onChange={e => update('age', onlyDigits(3)(e.target.value))} onBlur={() => blur('age')} aria-invalid={!!err('age')} />
                  <Err k="age" />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pf-gender">Gender</label>
                  <select id="pf-gender" value={p.gender} onChange={e => update('gender', e.target.value)} onBlur={() => blur('gender')}>
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <Err k="gender" />
                </div>
                <div className="field">
                  <label htmlFor="pf-phone">Phone</label>
                  <input id="pf-phone" type="tel" inputMode="numeric" value={p.phone} maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile number"
                    onChange={e => update('phone', onlyDigits(10)(e.target.value))} onBlur={() => blur('phone')} aria-invalid={!!err('phone')} />
                  <Err k="phone" />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pf-emergencyName">Emergency contact name</label>
                  <input id="pf-emergencyName" value={p.emergencyName} maxLength={50} placeholder="Name of a close person"
                    onChange={e => update('emergencyName', onlyLetters(e.target.value))} onBlur={() => blur('emergencyName')} aria-invalid={!!err('emergencyName')} />
                  <Err k="emergencyName" />
                </div>
                <div className="field">
                  <label htmlFor="pf-emergencyPhone">Emergency contact number</label>
                  <input id="pf-emergencyPhone" type="tel" inputMode="numeric" value={p.emergencyPhone} maxLength={10} placeholder="10-digit mobile number"
                    onChange={e => update('emergencyPhone', onlyDigits(10)(e.target.value))} onBlur={() => blur('emergencyPhone')} aria-invalid={!!err('emergencyPhone')} />
                  <Err k="emergencyPhone" />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pf-type">User type</label>
                  <select id="pf-type" value={p.type} onChange={e => update('type', e.target.value as Profile['type'])}>
                    <option>Elderly</option>
                    <option>General Public</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="pf-country">Country</label>
                  <input id="pf-country" value="India" disabled readOnly />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pf-state">State / UT</label>
                  <select id="pf-state" value={p.state} onChange={e => onState(e.target.value)} onBlur={() => blur('state')}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <Err k="state" />
                </div>
                <div className="field">
                  <label htmlFor="pf-city">City</label>
                  <select id="pf-city" value={cityOther ? OTHER : p.city} disabled={!p.state}
                    onChange={e => onCity(e.target.value)} onBlur={() => blur('city')}>
                    <option value="">{p.state ? 'Select city' : 'Select state first'}</option>
                    {citiesOf(p.state).map(c => <option key={c}>{c}</option>)}
                    {p.state && <option value={OTHER}>Other (not in list)</option>}
                  </select>
                  {cityOther && (
                    <input id="pf-city-other" value={p.city} maxLength={60} placeholder="Type your city / town" style={{ marginTop: 8 }}
                      onChange={e => update('city', onlyLetters(e.target.value))} onBlur={() => blur('city')} />
                  )}
                  <Err k="city" />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pf-pincode">Pincode</label>
                  <input id="pf-pincode" inputMode="numeric" value={p.pincode} maxLength={6} autoComplete="postal-code" placeholder="6-digit pincode"
                    onChange={e => update('pincode', onlyDigits(6)(e.target.value))} onBlur={() => blur('pincode')} aria-invalid={!!err('pincode')} />
                  <Err k="pincode" />
                </div>
                <div className="field" />
              </div>

              <div className="field">
                <label htmlFor="pf-address">Address (house no., street, landmark)</label>
                <textarea id="pf-address" value={p.address} maxLength={200} placeholder="House / flat no., street, area, landmark"
                  onChange={e => update('address', e.target.value.replace(/[^\p{L}\p{M}\p{N} ,.\-/#()&'’:]/gu, ''))} onBlur={() => blur('address')} aria-invalid={!!err('address')} />
                <Err k="address" />
              </div>

              {p.type === 'Elderly' && (
                <div className="card" style={{ background: 'var(--card-soft)' }}>
                  <div className="card-title">Elderly-specific (optional)</div>
                  <div className="row" style={{ marginTop: 14 }}>
                    <div className="field">
                      <label htmlFor="pf-caregiverName">Family / caregiver name</label>
                      <input id="pf-caregiverName" value={p.caregiverName} maxLength={50} placeholder="Caregiver name"
                        onChange={e => update('caregiverName', onlyLetters(e.target.value))} onBlur={() => blur('caregiverName')} />
                      <Err k="caregiverName" />
                    </div>
                    <div className="field">
                      <label htmlFor="pf-caregiverPhone">Family / caregiver phone</label>
                      <input id="pf-caregiverPhone" type="tel" inputMode="numeric" value={p.caregiverPhone} maxLength={10} placeholder="10-digit mobile number"
                        onChange={e => update('caregiverPhone', onlyDigits(10)(e.target.value))} onBlur={() => blur('caregiverPhone')} />
                      <Err k="caregiverPhone" />
                    </div>
                  </div>
                </div>
              )}

              {saveError && <div className="error-state" role="alert">{saveError}</div>}

              <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                <Save size={17} />
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          )}
        </div>

        {saved && <div className="toast" role="status">Profile saved.</div>}
        <Footer />
      </main>
    </>
  )
}
