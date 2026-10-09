"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  HeartPulse,
  Home,
  Moon,
  Plus,
  Sun,
  UserRound,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import FamilySwitcher from "./FamilySwitcher";

const items = [
  ["/dashboard", "Dashboard", Home],
  ["/profile", "Profile", UserRound],
  ["/vitals", "Vitals Vault", HeartPulse],
  ["/documents", "Medical Records", FileText],
  ["/booking", "Healthcare Booking", CalendarDays],
] as const;

export default function AppNav() {
  const path = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("ayumarg-theme");

    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;

    setDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ayumarg-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ayumarg-theme", "light");
    }
  }

  return (
    <>
      {/* TOP BAR */}

      <header className="topbar">
        <Link href="/dashboard" className="brand" aria-label="AyuMarg – go to dashboard">
          <Image
            src="/assets/ayumarg-logo.png"
            alt=""
            width={52}
            height={52}
            quality={100}
            className="brand-logo glow-logo"
          />
          <span className="brand-text">
            <span className="brand-name">AyuMarg</span>
            <span className="brand-tag">We care</span>
          </span>
        </Link>

        <div className="top-actions">
          <FamilySwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <UserButton />
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}

      <aside className="sidebar">
        <div className="nav-label">Care space</div>

        <nav className="nav-list">
          {items.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${
                path?.startsWith(href) ? "active" : ""
              }`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* CARE TOOLKIT */}

        <div className="care-toolkit">
          <div className="toolkit-icon">
            <Plus size={18} />
          </div>

          <div className="toolkit-title">Care Toolkit</div>

          <div className="toolkit-text">
            Keep health information, records and care services together.
          </div>

          <Link href="/booking" className="toolkit-button">
            Book healthcare
            <CalendarDays size={14} />
          </Link>
        </div>

        {/* MEDICAL CROSS */}

        <div className="medical-cross-box">
          <span className="cross-horizontal" />
          <span className="cross-vertical" />
        </div>
      </aside>

      {/* MOBILE NAV */}

      <nav className="mobile-nav">
        {items.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={`mobile-nav-item ${
              path?.startsWith(href) ? "active" : ""
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
