import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import { CATEGORIES } from "../lib/categories";
import { SITE } from "../lib/site";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeCheck,
  Lock,
  CalendarDays,
  Clock,
  FileUp,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";

const IMG = {
  hero: "/assets/images/doctor_stethoscope_checkup_hero.webp",
  elderly: "/assets/images/elderly_care_female_doctor_with_senior.webp",
  nurse: "/assets/images/second_opinion_woman_doctor_tablet.webp",
  opd: "/assets/images/mental_health_male_doctor_consultation.webp",
  wellbeing: "/assets/images/second_opinion_woman_doctor_tablet.webp",
};

const WA_LINK = `https://wa.me/${SITE.doctorPhone.replace(/\D/g, "")}`;

export default function Home() {
  return (
    <div className="auth-wrap">
      {/* .land = fluid wrapper (max-width grows on 2xl screens) */}
      <div className="land">
        <div className="card land-card">
          {/* TEXTURE BLOBS */}
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* HEADER */}
            <div className="land-header">
              <div className="brand">
                <Image
                  src="/assets/ayumarg-logo.png"
                  alt="AayuMarg logo"
                  width={56}
                  height={56}
                  priority
                  quality={100}
                  className="brand-logo glow-logo"
                  style={{ width: 56, height: 56 }}
                />
                <span className="brand-text">
                  <span className="brand-name">AayuMarg</span>
                  <span className="brand-tag">“We care”</span>
                </span>
              </div>

              {/* LOGGED OUT */}
              <Show when="signed-out">
                <div className="land-actions">
                  <SignInButton mode="modal">
                    <button className="btn btn-secondary">Sign in</button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="btn btn-primary">Create account</button>
                  </SignUpButton>
                </div>
              </Show>

              {/* LOGGED IN */}
              <Show when="signed-in">
                <Link className="btn btn-primary" href="/dashboard">
                  Open dashboard
                  <ArrowRight size={16} />
                </Link>
              </Show>
            </div>

            {/* HERO */}
            <div className="hero-grid">
              {/* LEFT: COPY */}
              <div>
                <div className="eyebrow">
                  <Sparkles size={13} />
                  &nbsp;Family care platform &middot; “We care”
                </div>

                {/* ── Req 1: Bold "AayuMarg We Care" heading, no dense paragraph ── */}
                <h1
                  className="h1"
                  style={{
                    fontSize: "clamp(30px, 5.2vw, 60px)",
                    marginTop: 14,
                    lineHeight: 1.12,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
                    <span>
                      <span className="grad-text">AayuMarg</span>
                      <br />
                      <span style={{ fontWeight: 900, letterSpacing: "-0.03em", color: "var(--primary)" }}>"We Care."</span>
                    </span>
                    <Image
                      src="/AyuMarg Healthcare Logo.png"
                      alt="AayuMarg logo"
                      width={200}
                      height={200}
                      className="hero-logo-img"
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                </h1>

                {/* Sub-tagline replaces the removed dense paragraph */}
                <p
                  className="hero-tagline"
                  style={{
                    marginTop: 14,
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 700,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  OPD consultations &bull; Family health records &bull; 24&times;7 care &mdash; all in one place.
                </p>

                {/* ── Req 2: WhatsApp Direct Inquiry Widget ── */}
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-widget"
                  aria-label={`Chat on WhatsApp: ${SITE.doctorPhone}`}
                >
                  {/* WhatsApp SVG icon */}
                  <svg
                    viewBox="0 0 32 32"
                    width="36"
                    height="36"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="16" cy="16" r="16" fill="#25D366" />
                    <path
                      d="M23.5 19.9c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.18.2-.35.22-.65.07-1.77-.88-2.93-1.57-4.1-3.56-.31-.53.31-.5.89-1.66.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5-.17 0-.37-.02-.57-.02s-.52.07-.79.37c-.27.3-1.03 1.01-1.03 2.45s1.06 2.84 1.2 3.04c.15.2 2.07 3.17 5.04 4.44.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.19-.57-.34z"
                      fill="#fff"
                    />
                  </svg>

                  <div className="wa-widget-text">
                    <span className="wa-widget-label">Chat with us on WhatsApp</span>
                    <span className="wa-widget-number">{SITE.doctorPhone}</span>
                  </div>

                  <span className="wa-widget-badge">Tap to chat</span>
                </a>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 22,
                  }}
                >
                  <Show when="signed-out">
                    <SignUpButton mode="modal">
                      <button className="btn btn-primary">
                        Start demo
                        <ArrowRight size={17} />
                      </button>
                    </SignUpButton>
                  </Show>

                  <Show when="signed-in">
                    <Link className="btn btn-primary" href="/dashboard">
                      Go to my care space
                      <ArrowRight size={17} />
                    </Link>
                  </Show>

                  <a className="btn btn-gold" href="#services">
                    <Star size={16} />
                    Explore services
                  </a>
                </div>

                {/* TRUST ROW */}
                <div className="trust-row">
                  <span className="trust-item">
                    <ShieldCheck size={15} color="var(--primary)" />
                    Clerk-secured sign-in
                  </span>
                  <span className="trust-item">
                    <Clock size={15} color="var(--primary)" />
                    24&times;7 care access
                  </span>
                  <span className="trust-item">
                    <BadgeCheck size={15} color="var(--primary)" />
                    Built for families
                  </span>
                </div>

                {/* AVATAR STRIP */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 26,
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <span
                      className="avatar-circle"
                      style={{ marginRight: -14 }}
                    >
                      <Image
                        src={IMG.wellbeing}
                        alt="Care professional"
                        width={44}
                        height={44}
                        style={{
                          objectFit: "cover",
                          objectPosition: "50% 25%",
                        }}
                      />
                    </span>
                    <span
                      className="avatar-circle"
                      style={{ marginRight: -14 }}
                    >
                      <Image
                        src={IMG.opd}
                        alt="Care professional"
                        width={44}
                        height={44}
                        style={{ objectFit: "cover" }}
                      />
                    </span>
                    <span className="avatar-circle">
                      <Image
                        src={IMG.nurse}
                        alt="Family member"
                        width={44}
                        height={44}
                        style={{
                          objectFit: "cover",
                          objectPosition: "50% 25%",
                        }}
                      />
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    Designed alongside caregivers &amp; families
                    <br />
                    who look after loved ones every day.
                  </div>
                </div>
              </div>

              {/* RIGHT: HERO PHOTO */}
              <div className="photo-card hero-photo">
                <Image
                  src={IMG.hero}
                  alt="Calm AayuMarg partner clinic reception"
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />

                <span className="float-chip" style={{ bottom: 18, left: 18 }}>
                  <HeartPulse size={14} color="var(--primary)" />
                  Health records, together
                </span>

                <span className="float-chip" style={{ bottom: 18, right: 18 }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  Protected profile
                </span>
              </div>
            </div>

            {/* SERVICES */}
            <div id="services" className="section-head" style={{ marginTop: 6 }}>
              <div>
                <div className="eyebrow">Our services</div>
                <h2>OPD care for every need in your family</h2>
                <p className="muted section-lead">
                  Book consultations for elderly care, second opinions, mental
                  health and sexual health. Mental and sexual health bookings
                  stay confidential.
                </p>
              </div>
            </div>

            {/* ── Req 3: Enhanced OPD booking cards with glow CTA ── */}
            <div className="category-grid">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/booking?category=${c.id}`}
                  className={`category-card glass opd-card-glow ${
                    c.id === "second-opinion" ? "second-opinion-card" : ""
                  }`}
                >
                  <span className="category-photo">
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(max-width: 559px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      style={{ objectFit: "cover", objectPosition: c.position }}
                    />
                    {c.badge && (
                      <span className="category-badge">
                        <Lock size={11} /> {c.badge}
                      </span>
                    )}
                  </span>
                  <span className="category-body">
                    <b>{c.title}</b>
                    <span className="muted">{c.blurb}</span>
                    {/* Enhanced CTA button */}
                    <span className="category-cta-btn">
                      <CalendarDays size={14} />
                      Book Now
                      <ArrowRight size={13} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <Show when="signed-out">
              <div className="services-cta">
                <SignUpButton mode="modal">
                  <button className="btn btn-primary services-cta-btn">
                    Sign up to book an OPD visit
                    <ArrowRight size={17} />
                  </button>
                </SignUpButton>
                <span className="muted">
                  Already a member?{" "}
                  <SignInButton mode="modal">
                    <button className="link-btn">Sign in</button>
                  </SignInButton>
                </span>
              </div>
            </Show>

            {/* CARE TOOLS */}
            <div className="section-head" style={{ marginTop: 40 }}>
              <div>
                <div className="eyebrow">Your care space</div>
                <h2>Everything your family needs, together</h2>
              </div>
            </div>

            <div id="features" className="grid grid-4">
              <div className="media-card feature-card">
                <div className="icon-box">
                  <UsersRound size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Family profiles</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Name, age, contact, address and caregiver details &mdash; kept
                    together and easy to update.
                  </div>
                </div>
              </div>

              <div className="media-card feature-card">
                <div className="icon-box">
                  <HeartPulse size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Vitals Vault</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Blood pressure, heart rate, SpO&#x2082;, temperature, sugar and
                    weight, all in one place.
                  </div>
                </div>
              </div>

              <div className="media-card feature-card">
                <div className="icon-box">
                  <FileUp size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Medical Records</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Upload prescriptions, lab reports and scans as PDF or
                    images, and find them again easily.
                  </div>
                </div>
              </div>

              <div className="media-card feature-card">
                <div className="icon-box">
                  <CalendarDays size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Easy OPD booking</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Pick a service, date and time for any family member and keep
                    every booking in one place.
                  </div>
                </div>
              </div>
            </div>

            {/* TESTIMONIALS */}
            <Testimonials />

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
