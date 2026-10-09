# AyuMarg — API Contract (frontend → backend)

All calls go through `lib/api/client.ts` (the only place that uses `fetch`).
Base URL: `NEXT_PUBLIC_API_BASE_URL` (default `/api`).
Auth: `Authorization: Bearer <Clerk session token>` on every request — the backend must verify it with Clerk.
Bodies are JSON unless noted. Types: `lib/types.ts`.

**Status legend:** `MOCK` = frontend currently serves this from browser storage (`NEXT_PUBLIC_USE_MOCKS=true`). `FUTURE` = no UI uses it yet; contract only.
**No endpoint below exists on a real backend yet.** Set `NEXT_PUBLIC_USE_MOCKS=false` after implementing them.

| Feature | Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|---|
| Current user | GET | `/auth/me` | Yes | — | `{ id, email, name }` | FUTURE |
| Get profile | GET | `/users/profile` | Yes | — | `Profile` (404 if none) | MOCK |
| Save profile | PUT | `/users/profile` | Yes | `Profile` | `Profile` | MOCK |
| List vitals | GET | `/vitals` | Yes | — | `Vital[]` newest first | MOCK |
| Latest vital | GET | `/vitals/latest` | Yes | — | `Vital` (404 if none) | FUTURE |
| Add vital | POST | `/vitals` | Yes | `Vital` | `Vital` (with `id`) | MOCK |
| List documents | GET | `/documents` | Yes | — | `MedicalDocument[]` | MOCK |
| Upload document | POST | `/documents` | Yes | `multipart/form-data`, field `file` (PDF/JPG/PNG) | `MedicalDocument` | MOCK (metadata only) |
| Delete document | DELETE | `/documents/:id` | Yes | — | `204` | MOCK |
| Latest booking | GET | `/bookings/latest` | Yes | — | `Booking` (404 if none) | MOCK |
| Create booking | POST | `/bookings` | Yes | `Booking` | `Booking` (with `id`) | MOCK |
| AI chat | POST | `/ai/chat` | Yes | `{ messages: {role, content}[] }` | `{ reply: string }` | FUTURE |
| AI health summary | GET | `/ai/health-summary` | Yes | — | `{ summary, generatedAt }` | FUTURE |

## Shapes
```ts
Profile  { name, age, gender, phone, emergency, address, type: "Elderly"|"General Public", caregiverName, caregiverPhone }
Vital    { id?, date, bp, hr, spo2, temp, sugar, weight }          // all strings, as entered in the form
MedicalDocument { id, name, size, type, date }
Booking  { id?, service, date, time, reason, status, category?: "elderly"|"second-opinion"|"mental-health"|"sexual-health", patientId?, patientName?, attachments?: string[] }
```

Notes: OPD bookings attach reports/photos by first uploading each file via `POST /documents`, then sending the file names in `attachments`.
Mental/Sexual Health bookings are confidential: the backend should restrict them to the account holder and never expose `reason` to other family members.

## Errors
The client maps HTTP status → friendly text (`lib/api/errors.ts`): 400/422 validation, 401 session expired, 403 forbidden,
404 not found, 409 conflict, 429 rate limit, 5xx server, plus network failure, timeout and malformed JSON.
Backend suggestion: return `{ "error": { "code": "...", "message": "..." } }`; the frontend never shows raw server text.

## AI
Browser → `/ai/*` on YOUR backend → AI agent/model. Provider keys and agent logic stay server-side.
Responses are informational, not medical diagnosis. AI calls use a 30 s timeout.

## Privacy note
Mock mode keeps data in `localStorage` for demos only. Do not store real patient data there; the backend replaces it.
