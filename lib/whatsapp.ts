/** Accepts 10-digit Indian numbers or +country-code numbers. */
export const isValidWhatsapp = (v: string) => /^\+?\d[\d\s-]{8,17}$/.test(v.trim());
