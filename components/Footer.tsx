import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} AyuMarg · We care</span>
      <nav className="footer-links" aria-label="Footer">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/booking">Healthcare Booking</Link>
      </nav>
    </footer>
  );
}
