import { SITE } from "@/lib/site";

/**
 * Floating WhatsApp button — rendered globally in the root layout.
 * Fixed to bottom-right, pulse-glow animation, no JS needed.
 */
export default function FloatingWhatsApp() {
  const phone = SITE.doctorPhone.replace(/\D/g, "");
  const href = `https://wa.me/${phone}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fab-wa"
      aria-label={`Chat on WhatsApp: ${SITE.doctorPhone}`}
    >
      {/* WhatsApp logo SVG */}
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M27.5 4.5C24.5 1.5 20.4 0 16 0 7.2 0 .1 7.1.1 15.9c0 2.8.7 5.5 2.1 7.9L0 32l8.4-2.2c2.3 1.3 4.9 1.9 7.6 1.9h.1C24.8 31.7 32 24.6 32 15.8c0-4.3-1.7-8.3-4.5-11.3zm-11.5 24c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.9 1.3 1.3-4.8-.3-.5c-1.3-2.1-2-4.5-2-7C2.9 8.3 8.8 2.4 16 2.4c3.5 0 6.8 1.4 9.3 3.8 2.5 2.5 3.8 5.8 3.8 9.4.1 7.3-5.9 13.9-13.1 13.9zm7.7-10.4c-.4-.2-2.4-1.2-2.8-1.3-.4-.2-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.3-.5.3-.9.1-2.4-1.2-4-2.2-5.5-5-.4-.8.4-.7 1.2-2.3.1-.3.1-.5-.1-.7-.2-.2-1-2.4-1.4-3.3-.4-.9-.7-.8-.9-.8h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.9 4.4 6.9 6.1 2.6 1.1 3.6 1.2 4.9.9 .8-.2 2.4-1 2.7-1.9.3-.9.3-1.7.2-1.9-.2-.1-.5-.3-.9-.5z"
          fill="white"
        />
      </svg>

      {/* Pulse rings (CSS animated) */}
      <span className="fab-wa-ring" aria-hidden="true" />
    </a>
  );
}

