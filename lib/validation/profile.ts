import type { Profile } from "@/lib/types";
import {
  checkAddressLine, checkAge, checkCityText, checkGender, checkMobile, checkName, checkPincode, collapseSpaces,
  type Check,
} from "./common";
import LOCATIONS from "@/lib/data/india-locations.json";

export const OTHER = "Other";
export const STATES: string[] = Object.keys(LOCATIONS).sort((a, b) => a.localeCompare(b));
export const citiesOf = (state: string): string[] => (LOCATIONS as Record<string, string[]>)[state] ?? [];

export type ProfileErrors = Partial<Record<keyof Profile | "city", string>>;

/** Field-by-field validation of the whole profile. Empty object = valid. */
export function validateProfile(p: Profile): ProfileErrors {
  const e: ProfileErrors = {};
  const put = (k: keyof Profile, c: Check) => { if (c) e[k] = c; };

  put("name", checkName(p.name, "Name"));
  put("age", checkAge(p.age));
  put("gender", checkGender(p.gender));
  put("phone", checkMobile(p.phone, "Phone number"));
  put("emergencyName", checkName(p.emergencyName, "Emergency contact name"));
  put("emergencyPhone", checkMobile(p.emergencyPhone, "Emergency contact number"));
  if (!e.emergencyPhone && !e.phone && p.emergencyPhone === p.phone) {
    e.emergencyPhone = "Emergency contact number must be different from your own number.";
  }

  if (!p.state || !STATES.includes(p.state)) e.state = "Please select a state.";
  if (!p.city) e.city = "Please select a city.";
  else if (p.city === OTHER) e.city = "Please type your city name.";
  else if (p.state && STATES.includes(p.state) && !citiesOf(p.state).includes(p.city)) {
    // "Other" cities are stored as the typed name, so only the format is checked
    put("city", checkCityText(p.city));
  }
  put("pincode", checkPincode(p.pincode));
  put("address", checkAddressLine(p.address));

  if (p.type === "Elderly" && (p.caregiverName || p.caregiverPhone)) {
    if (p.caregiverName) put("caregiverName", checkName(p.caregiverName, "Caregiver name"));
    else e.caregiverName = "Caregiver name is required when a number is given.";
    if (p.caregiverPhone) put("caregiverPhone", checkMobile(p.caregiverPhone, "Caregiver number"));
    else e.caregiverPhone = "Caregiver number is required when a name is given.";
  }
  return e;
}

/** Trim + collapse spaces before sending. */
export function cleanProfile(p: Profile): Profile {
  return {
    ...p,
    name: collapseSpaces(p.name), age: p.age.trim(), phone: p.phone.trim(),
    emergencyName: collapseSpaces(p.emergencyName), emergencyPhone: p.emergencyPhone.trim(),
    city: collapseSpaces(p.city), pincode: p.pincode.trim(), address: collapseSpaces(p.address),
    caregiverName: collapseSpaces(p.caregiverName), caregiverPhone: p.caregiverPhone.trim(),
  };
}
