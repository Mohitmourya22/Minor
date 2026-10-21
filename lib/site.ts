/**
 * Single place for brand + contact details.
 * Change them here and they update everywhere (footer, etc.).
 */
export const SITE = {
  name: "AayuMarg",
  tagline: "We care",

  // Shown to the patient ONLY after payment (not on the public site).
  doctorPhone: "+91-7000698030",

  email: "info@aayumarg.com",

  instagramUrl: "https://www.instagram.com/aayumarg",
  instagramHandle: "@aayumarg",
};

/** "+91-98765 43210" -> "tel:+919876543210"; returns null for the XXXX placeholder. */
export function phoneHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  return /^\+\d{10,15}$/.test(digits) ? `tel:${digits}` : null;
}
