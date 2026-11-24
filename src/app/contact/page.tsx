import { ContactChannels, ContactForm } from "@/components/ContactSurface";
import { profile } from "@/data/portfolio";

/**
 * Contact page: identical channels and form to the homepage contact
 * section — the single canonical contact surface.
 */
export default function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-1 text-4xl font-extrabold">Let&apos;s build something intelligent.</h1>
          <p className="mt-4 leading-7" style={{ color: "var(--muted)" }}>
            Recruiters, collaborators, fellow builders — my inbox is open. {profile.availability},
            based in {profile.location}. I read every message myself and reply personally
            from {profile.email}.
          </p>
          <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>
            Hiring for an AI engineering internship or an entry-level role, want to talk
            about VERITAS, SafeGen AI or ASTRA, or just comparing notes on building with
            LLMs — write below, or reach me directly on any channel here.
          </p>
          <div className="mt-6">
            <ContactChannels />
          </div>
        </div>
        <div className="h-fit card p-6">
          <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>Send a message</p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
