import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.4.8-1.5.1-.2 0-.3 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3zM12.1 21.5h-.1c-1.8 0-3.5-.5-5-1.4L4 21l.9-3C4 16.4 3.4 14.6 3.4 12.7 3.4 7.9 7.3 4 12.1 4c2.3 0 4.5.9 6.1 2.5 1.6 1.6 2.5 3.8 2.5 6.1-.1 4.8-4 8.9-8.6 8.9zm7.9-16.4C18 3.2 15.1 2 12.1 2 6.2 2 1.4 6.8 1.4 12.7c0 1.9.5 3.8 1.4 5.4L1 23l5.1-1.3c1.6.9 3.3 1.3 5.1 1.3h.1c5.9 0 10.7-4.8 10.7-10.7 0-2.9-1.1-5.6-3-7.6z" />
    </svg>
  );
}

/** lucide-react v1 no longer ships brand icons, so Instagram is an inline SVG. */
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* 1 column on phones -> 2 on tablets -> 3 on laptops (see .footer-grid) */}
      <div className="footer-grid">
        <div className="footer-col footer-about">
          <b className="footer-title">{SITE.name}</b>
          <p>
            A calm digital space for families to book OPD consultations and keep
            profiles, health vitals and medical records in one place.
          </p>
        </div>

        <nav className="footer-col" aria-label="Footer">
          <b className="footer-title">Quick links</b>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/booking">Healthcare Booking</Link>
        </nav>

        <div className="footer-col" id="contact">
          <b className="footer-title">Contact us</b>

          <a href={`mailto:${SITE.email}`}>
            <Mail size={16} /> {SITE.email}
          </a>

          <a
            href={`https://wa.me/${SITE.doctorPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />WhatsApp {SITE.doctorPhone}
          </a>

          <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
            <InstagramIcon /> Instagram {SITE.instagramHandle}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
      </div>
    </footer>
  );
}
