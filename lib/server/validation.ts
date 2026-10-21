import "server-only";
import { z } from "zod";
import { badRequest } from "./http";
import {
  checkAddressLine, checkAge, checkCityText, checkGender, checkMobile, checkName, checkPincode, collapseSpaces, type Check,
} from "@/lib/validation/common";
import { STATES } from "@/lib/validation/profile";
import { checkReason, checkSlot, checkWhatsapp, cleanReason, cleanWhatsapp } from "@/lib/validation/booking";
import { checkBp, checkVitalDate, LIMITS } from "@/lib/validation/vitals";
import { todayIst } from "@/lib/validation/booking";

const text = (max: number) => z.string().trim().max(max);

/** Turn one of our "return message or null" checks into a zod rule that reports the same message. */
const rule = (fn: (v: string) => Check) => (v: string, ctx: z.RefinementCtx) => {
  const msg = fn(v);
  if (msg) ctx.addIssue({ code: "custom", message: msg });
};
const clean = z.string().max(400).transform(collapseSpaces);

export const profileSchema = z.object({
  name: clean.superRefine(rule((v) => checkName(v, "Name"))),
  age: z.string().trim().superRefine(rule(checkAge)),
  gender: z.string().superRefine(rule(checkGender)),
  phone: z.string().trim().superRefine(rule((v) => checkMobile(v, "Phone number"))),
  emergencyName: clean.superRefine(rule((v) => checkName(v, "Emergency contact name"))),
  emergencyPhone: z.string().trim().superRefine(rule((v) => checkMobile(v, "Emergency contact number"))),
  state: z.string().refine((v) => STATES.includes(v), "Please select a valid state."),
  city: clean.superRefine(rule(checkCityText)),
  pincode: z.string().trim().superRefine(rule(checkPincode)),
  address: clean.superRefine(rule(checkAddressLine)),
  type: z.enum(["Elderly", "General Public"]),
  caregiverName: clean.superRefine(rule((v) => (v ? checkName(v, "Caregiver name") : null))),
  caregiverPhone: z.string().trim().superRefine(rule((v) => (v ? checkMobile(v, "Caregiver number") : null))),
}).superRefine((p, ctx) => {
  if (p.emergencyPhone === p.phone) {
    ctx.addIssue({ code: "custom", path: ["emergencyPhone"], message: "Emergency contact number must be different from your own number." });
  }
  if (!!p.caregiverName !== !!p.caregiverPhone) {
    ctx.addIssue({ code: "custom", path: ["caregiverName"], message: "Give both the caregiver name and number, or leave both empty." });
  }
});

const vNum = (label: string, min: number, max: number, decimal: boolean) =>
  z.string().trim().superRefine(rule((v) => {
    if (!(decimal ? /^\d{1,3}(\.\d)?$/ : /^\d{1,3}$/).test(v)) return `${label} must be a valid number.`;
    const n = Number(v);
    return n < min || n > max ? `${label} must be between ${min} and ${max}.` : null;
  }));

export const vitalSchema = z.object({
  date: z.string().trim().superRefine(rule((v) => checkVitalDate(v, todayIst()))),
  bp: z.string().trim().superRefine(rule(checkBp)),
  hr: vNum("Heart rate", LIMITS.hr.min, LIMITS.hr.max, false),
  spo2: vNum("SpO2", LIMITS.spo2.min, LIMITS.spo2.max, false),
  temp: vNum("Temperature", LIMITS.temp.min, LIMITS.temp.max, true),
  sugar: vNum("Blood sugar", LIMITS.sugar.min, LIMITS.sugar.max, true),
  weight: vNum("Weight", LIMITS.weight.min, LIMITS.weight.max, true),
});

export const CATEGORY_IDS = ["elderly", "second-opinion", "mental-health", "sexual-health"] as const;

export const bookingSchema = z.object({
  service: z.string().trim().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  reason: z.string().max(3000).default("").superRefine(rule(checkReason)).transform(cleanReason),
  category: z.enum(CATEGORY_IDS).optional(),
  patientId: text(100).optional(),
  patientName: text(100).refine((v) => !/[<>{}`\\]/.test(v), "Invalid name.").optional(),
  whatsapp: z.string().max(30).superRefine(rule(checkWhatsapp)).transform(cleanWhatsapp),
  attachments: z.array(text(200)).max(6).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});

export const submitPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  utr: z.string().trim().regex(/^\d{12}$/, "UTR must be 12 digits"),
});

export const createOrderSchema = z.object({ bookingId: z.string().uuid() });

/** Parse a JSON body with a zod schema; any problem becomes a clean 400. */
export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const custom = parsed.error.issues.find((i) => i.code === "custom");
    if (custom) throw badRequest(custom.message); // our own friendly validation messages
    const fields = [...new Set(parsed.error.issues.map((i) => i.path.join(".") || "body"))];
    throw badRequest(`Invalid fields: ${fields.join(", ")}`);
  }
  return parsed.data;
}

/** A booking date must be real, not far in the past (1 day grace for time zones) and within a year. */
export function assertBookingSlotOk(date: string, time: string): void {
  const msg = checkSlot(date, time);
  if (msg) throw badRequest(msg);
}

export function assertBookingDateOk(date: string): void {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) throw badRequest("Invalid date.");
  const day = 24 * 60 * 60 * 1000;
  const diff = d.getTime() - Date.now();
  if (diff < -2 * day) throw badRequest("The booking date is in the past.");
  if (diff > 366 * day) throw badRequest("The booking date is too far ahead.");
}
