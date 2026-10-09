import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import { CATEGORIES } from "../lib/categories";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeCheck,
  Lock,
  CalendarDays,
  Clock,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";

const IMG = {
  hero: "/assets/images/doctor_stethoscope_checkup_hero.webp",
  elderly: "/assets/images/elderly_care_female_doctor_with_senior.webp",
  nurse: "/assets/images/elderly_care_female_doctor_with_senior.webp",
  opd: "/assets/images/mental_health_male_doctor_consultation.webp",
  wellbeing: "/assets/images/second_opinion_woman_doctor_tablet.webp",
};

export default function Home() {
  return (
    <div className="auth-wrap">
      <div style={{ maxWidth: 1160, width: "100%" }}>
        <div
          className="card"
          style={{
            padding: 34,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* TEXTURE BLOBS */}
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div className="brand">
                <Image
                  src="/assets/ayumarg-logo.png"
                  alt="AyuMarg logo"
                  width={56}
                  height={56}
                  priority
                  quality={100}
                  className="brand-logo glow-logo"
                  style={{ width: 56, height: 56 }}
                />
                <span className="brand-text">
                  <span className="brand-name">AyuMarg</span>
                  <span className="brand-tag">We care</span>
                </span>
              </div>

              {/* LOGGED OUT */}
              <Show when="signed-out">
                <div style={{ display: "flex", gap: 10 }}>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 40,
                alignItems: "center",
                padding: "60px 0 55px",
              }}
              className="hero-grid"
            >
              {/* LEFT: COPY */}
              <div>
                <div className="eyebrow">
                  <Sparkles size={13} />
                  &nbsp;Family care platform · We care
                </div>

                <h1
                  className="h1"
                  style={{
                    fontSize: "clamp(38px, 5.4vw, 62px)",
                    marginTop: 16,
                  }}
                >
                  Care, connected.
                  <br />
                  <span className="grad-text">Simple enough for everyone.</span>
                </h1>

                <p className="sub" style={{ fontSize: 17 }}>
                  A calm digital space for AyuMarg families to connect, manage
                  essential health information, and stay closer to the care that
                  matters — all in one warm, easy place.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 25,
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

                  <a className="btn btn-gold" href="#features">
                    <Star size={16} />
                    See how it works
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
                    24×7 care access
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
              <div
                className="photo-card"
                style={{ height: 430, position: "relative" }}
              >
                <Image
                  src={IMG.hero}
                  alt="Calm AyuMarg partner clinic reception"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
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

            {/* FEATURES — TEXT CARDS */}
            <div id="features" className="grid grid-3" style={{ marginTop: 6 }}>
              <div className="media-card feature-card">
                <div className="icon-box">
                  <UsersRound size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Profile</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Name, age, contact, address and caregiver details — kept
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
                    Blood pressure, heart rate, SpO₂, temperature, sugar and
                    weight, all in one place.
                  </div>
                </div>
              </div>

              <div className="media-card feature-card">
                <div className="icon-box">
                  <ShieldCheck size={19} />
                </div>
                <div className="feature-card-body">
                  <div className="card-title">Secure sign-in</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Clerk authentication for the demo; backend storage and
                    verified providers come next.
                  </div>
                </div>
              </div>
            </div>

            {/* CARE CATEGORIES */}
            <div className="section-head" style={{ marginTop: 40 }}>
              <h2>Book an OPD visit</h2>
            </div>
            <div className="category-grid">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/booking?category=${c.id}`}
                  className={`category-card glass ${
                    c.id === "second-opinion" ? "second-opinion-card" : ""
                  }`}
                >
                  <span className="category-photo">
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 100vw, 25vw"
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
                    <span className="category-cta">
                      <CalendarDays size={14} /> Book OPD
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
