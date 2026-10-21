import type { Vital } from "@/lib/types";
import type { Check } from "./common";

/** Realistic human ranges. Anything outside is treated as a typing mistake. */
export const LIMITS = {
  sys: { min: 70, max: 250 },
  dia: { min: 40, max: 150 },
  hr: { min: 30, max: 220 },
  spo2: { min: 70, max: 100 },
  temp: { min: 90, max: 108 }, // °F
  sugar: { min: 20, max: 600 }, // mg/dL
  weight: { min: 1, max: 300 }, // kg
} as const;

export type VitalErrors = Partial<Record<keyof Vital, string>>;

const WHOLE = /^\d{1,3}$/;
const DEC1 = /^\d{1,3}(\.\d)?$/; // one decimal at most

function range(v: string, label: string, min: number, max: number, unit: string, decimal: boolean): Check {
  const t = v.trim();
  if (!t) return `${label} is required.`;
  if (!(decimal ? DEC1 : WHOLE).test(t)) return `${label} must be a ${decimal ? "number (max 1 decimal)" : "whole number"}.`;
  const n = Number(t);
  if (n < min || n > max) return `${label} must be between ${min} and ${max} ${unit}.`;
  return null;
}

export function checkBp(v: string): Check {
  const m = /^(\d{2,3})\s*\/\s*(\d{2,3})$/.exec(v.trim());
  if (!m) return "Blood pressure must look like 120/80.";
  const s = Number(m[1]), d = Number(m[2]);
  if (s < LIMITS.sys.min || s > LIMITS.sys.max) return `Upper (systolic) BP must be between ${LIMITS.sys.min} and ${LIMITS.sys.max}.`;
  if (d < LIMITS.dia.min || d > LIMITS.dia.max) return `Lower (diastolic) BP must be between ${LIMITS.dia.min} and ${LIMITS.dia.max}.`;
  if (s <= d) return "Upper BP must be higher than lower BP.";
  return null;
}

/** "YYYY-MM-DD" must be a real date, not in the future, not older than 1 year. `todayIst` = "YYYY-MM-DD". */
export function checkVitalDate(v: string, todayIst: string): Check {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Please choose a valid date.";
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return "Please choose a valid date.";
  if (v > todayIst) return "Date cannot be in the future.";
  const limit = new Date(`${todayIst}T00:00:00Z`);
  limit.setUTCFullYear(limit.getUTCFullYear() - 1);
  if (d < limit) return "Date cannot be older than 1 year.";
  return null;
}

export function validateVital(v: Vital, todayIst: string): VitalErrors {
  const e: VitalErrors = {};
  const put = (k: keyof Vital, c: Check) => { if (c) e[k] = c; };
  put("date", checkVitalDate(v.date, todayIst));
  put("bp", checkBp(v.bp));
  put("hr", range(v.hr, "Heart rate", LIMITS.hr.min, LIMITS.hr.max, "bpm", false));
  put("spo2", range(v.spo2, "SpO₂", LIMITS.spo2.min, LIMITS.spo2.max, "%", false));
  put("temp", range(v.temp, "Temperature", LIMITS.temp.min, LIMITS.temp.max, "°F", true));
  put("sugar", range(v.sugar, "Blood sugar", LIMITS.sugar.min, LIMITS.sugar.max, "mg/dL", true));
  put("weight", range(v.weight, "Weight", LIMITS.weight.min, LIMITS.weight.max, "kg", true));
  return e;
}
