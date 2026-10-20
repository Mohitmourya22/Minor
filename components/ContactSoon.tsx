import { Phone } from "lucide-react";
import { SITE, phoneHref } from "@/lib/site";

/** Shown to the patient after payment. */
export default function ContactSoon() {
  const tel = phoneHref(SITE.doctorPhone);
  return (
    <div className="muted" style={{ marginTop: 10 }}>
      <b>A healthcare person will be in touch soon.</b>
      <div style={{ marginTop: 6 }}>
        You can also reach us on{" "}
        {tel ? <a href={tel}><Phone size={14} /> {SITE.doctorPhone}</a> : SITE.doctorPhone}
      </div>
    </div>
  );
}
