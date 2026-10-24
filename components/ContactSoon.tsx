import { SITE } from "@/lib/site";

/** Shown to the patient after payment. Opens WhatsApp chat (not a call). */
export default function ContactSoon() {
  const digits = SITE.doctorPhone.replace(/\D/g, "");
  const waLink = `https://wa.me/${digits}`;
  return (
    <div className="muted" style={{ marginTop: 10 }}>
      <b>A healthcare person will be in touch soon.</b>
      <div style={{ marginTop: 6 }}>
        You can contact us on WhatsApp:{" "}
        <a href={waLink} target="_blank" rel="noopener noreferrer">
          {SITE.doctorPhone}
        </a>
      </div>
    </div>
  );
}