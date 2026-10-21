/**
 * Validation rules shared by the browser (instant messages) and the server (real protection).
 * Each function returns an error message, or null when the value is fine.
 * NO server-only imports here — this file runs in both places.
 */

export type Check = string | null;

/* ---------------- text helpers ---------------- */

export const collapseSpaces = (v: string) => v.replace(/\s+/g, " ").trim();
export const digitsOnly = (v: string) => v.replace(/\D/g, "");
export const wordCount = (v: string) => (v.trim() ? v.trim().split(/\s+/).length : 0);

// control chars, HTML / script brackets and template braces are never valid in any field
const DANGEROUS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>{}`\\]|javascript:|data:text|\bon\w+\s*=/i;
export const hasDangerousText = (v: string) => DANGEROUS.test(v);

/* ---------------- name ---------------- */

const NAME_RE = /^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u; // letters + single spaces only

export function checkName(raw: string, label = "Name"): Check {
  const v = collapseSpaces(raw);
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (v.length > 50) return `${label} can be at most 50 characters.`;
  if (/\d/.test(v)) return `${label} cannot contain numbers.`;
  if (!NAME_RE.test(v)) return `${label} can contain only letters and spaces (no special characters).`;
  if (/(.)\1{3,}/iu.test(v)) return `${label} looks invalid (a letter is repeated too many times).`;
  return null;
}

/* ---------------- age ---------------- */

export function checkAge(raw: string): Check {
  const v = raw.trim();
  if (!v) return "Age is required.";
  if (!/^\d{1,3}$/.test(v)) return "Age must be a whole number (digits only).";
  const n = Number(v);
  if (n < 1 || n > 150) return "Age must be between 1 and 150.";
  return null;
}

/* ---------------- mobile / WhatsApp ---------------- */

/** Indian mobile: 10 digits, starts with 6-9. */
export function checkMobile(raw: string, label = "Mobile number"): Check {
  const v = raw.trim();
  if (!v) return `${label} is required.`;
  if (!/^\d+$/.test(v)) return `${label} must contain digits only.`;
  if (v.length !== 10) return `${label} must be exactly 10 digits.`;
  if (!/^[6-9]/.test(v)) return `${label} must start with 6, 7, 8 or 9.`;
  if (/^(\d)\1{9}$/.test(v)) return `${label} looks invalid.`;
  return null;
}

/** Accepts "98765 43210", "+91 98765 43210", "919876543210" and returns the 10 digits (or the cleaned text if it can't). */
export function normalizeIndianMobile(raw: string): string {
  let d = digitsOnly(raw);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/* ---------------- gender / type ---------------- */

export const GENDERS = ["Female", "Male", "Other", "Prefer not to say"] as const;
export function checkGender(v: string): Check {
  return (GENDERS as readonly string[]).includes(v) ? null : "Please select a gender.";
}

/* ---------------- address ---------------- */

export function checkPincode(raw: string): Check {
  const v = raw.trim();
  if (!v) return "Pincode is required.";
  if (!/^\d+$/.test(v)) return "Pincode must contain digits only.";
  if (v.length !== 6) return "Pincode must be exactly 6 digits.";
  if (v.startsWith("0")) return "Pincode cannot start with 0.";
  return null;
}

const ADDRESS_RE = /^[\p{L}\p{M}\p{N} ,.\-/#()&'’:]+$/u;
export function checkAddressLine(raw: string): Check {
  const v = collapseSpaces(raw);
  if (!v) return "Address is required (house no., street, landmark).";
  if (v.length < 5) return "Address is too short.";
  if (v.length > 200) return "Address can be at most 200 characters.";
  if (!ADDRESS_RE.test(v) || hasDangerousText(v)) return "Address contains characters that are not allowed.";
  return null;
}

export function checkCityText(raw: string): Check {
  const v = collapseSpaces(raw);
  if (!v) return "City is required.";
  if (v.length < 2 || v.length > 60) return "City name must be 2–60 characters.";
  if (!/^[\p{L}\p{M} .'’-]+$/u.test(v)) return "City can contain only letters and spaces.";
  return null;
}
