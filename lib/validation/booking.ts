import { collapseSpaces, hasDangerousText, normalizeIndianMobile, checkMobile, wordCount, type Check } from "./common";

/** The clinic works in Indian time, so every booking date/time is treated as IST (UTC+05:30). */
export const MIN_LEAD_HOURS = 2;
export const MAX_DAYS_AHEAD = 90;
export const MAX_REASON_WORDS = 150;
const IST_MS = 5.5 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

/** Current IST date & time pieces for a given instant. */
export function istParts(at: number = Date.now()) {
  const d = new Date(at + IST_MS);
  return { date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` };
}
export const todayIst = () => istParts().date;

/** Epoch ms of a booking slot (date + time in IST). NaN if invalid. */
export function slotMs(date: string, time: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const ms = new Date(`${date}T${time}:00+05:30`).getTime();
  if (Number.isNaN(ms) || istParts(ms).date !== date) return NaN; // e.g. 2026-02-31
  return ms;
}

/** Earliest bookable slot = now + 2 h, rounded UP to the next 15 minutes. */
export function earliestSlot(now: number = Date.now()) {
  const step = 15 * 60 * 1000;
  const t = Math.ceil((now + MIN_LEAD_HOURS * 3600 * 1000) / step) * step;
  return istParts(t);
}

export function formatEarliest(now: number = Date.now()): string {
  const e = earliestSlot(now);
  const [h, m] = e.time.split(":").map(Number);
  const [y, mo, d] = e.date.split("-").map(Number);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1];
  return `${d} ${mon} ${y}, ${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

export function checkSlot(date: string, time: string, now: number = Date.now()): Check {
  const ms = slotMs(date, time);
  if (Number.isNaN(ms)) return "Please choose a valid date and time.";
  if (ms < now + MIN_LEAD_HOURS * 3600 * 1000 - 60 * 1000) { // 1 min grace for clock drift
    return `Bookings must be at least ${MIN_LEAD_HOURS} hours from now. Earliest available: ${formatEarliest(now)} (IST).`;
  }
  if (ms > now + MAX_DAYS_AHEAD * 24 * 3600 * 1000) return `You can book at most ${MAX_DAYS_AHEAD} days ahead.`;
  return null;
}

/** Reason: max 150 words, no markup / script characters. Empty is allowed (the caller supplies a default). */
export function checkReason(raw: string): Check {
  const v = raw.trim();
  if (!v) return null;
  const words = wordCount(v);
  if (words > MAX_REASON_WORDS) {
    return `Please keep the reason within ${MAX_REASON_WORDS} words (you have ${words}). It is emailed to the doctor, so a short summary is enough.`;
  }
  if (v.length > 1500) return "The reason is too long.";
  if (hasDangerousText(v)) return "The reason contains characters that are not allowed (such as < > { } or script text).";
  return null;
}
export const cleanReason = (raw: string) => collapseSpaces(raw.replace(/[\r\n]+/g, " "));

/** WhatsApp: Indian mobile; +91 / 91 / 0 prefix is accepted and removed. */
export function checkWhatsapp(raw: string): Check {
  if (/[^\d\s+\-()]/.test(raw)) return "WhatsApp number can contain only digits (and an optional +91).";
  return checkMobile(normalizeIndianMobile(raw), "WhatsApp number");
}
export const cleanWhatsapp = (raw: string) => normalizeIndianMobile(raw);
