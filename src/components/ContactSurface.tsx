"use client";
import { useState, type FormEvent } from "react";
import { profile } from "@/data/portfolio";
import { openAstraChat } from "@/components/AstraOrb";

/**
 * Direct contact channels, shared verbatim by the homepage contact section
 * and the Contact page — one component, so the two surfaces are identical
 * by construction. Submitting the form now POSTs to /api/contact, which
 * stores the message in the Neon inbox when the server is configured;
 * only when no database is configured yet does it fall back to opening
 * the visitor's mail app addressed to Shivam (stated honestly on the form).
 */
export function ContactChannels({ compact }: { compact?: boolean }) {
  const p = profile;
  const channels: Array<{ label: string; value: string; href?: string }> = [
    { label: "Email", value: p.email, href: `mailto:${p.email}` },
    { label: "GitHub", value: "shivvdev08-analyst", href: p.github },
    { label: "LinkedIn", value: "shivam-chaudhari", href: p.linkedin },
    { label: "Based in", value: p.location },
    { label: "Status", value: p.availability },
  ];
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {channels.map((c) => {
        const inner = (
          <>
            <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>{c.label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{c.value}</p>
          </>
        );
        return c.href ? (
          <a
            key={c.label}
            href={c.href}
            {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            className="card block rounded-2xl px-4 py-3"
            aria-label={`${c.label}: ${c.value}`}
          >
            {inner}
          </a>
        ) : (
          <div key={c.label} className="card rounded-2xl px-4 py-3">
            {inner}
          </div>
        );
      })}
      <button
        type="button"
        onClick={openAstraChat}
        aria-label="Ask ASTRA a question instead of writing a message"
        className="card block rounded-2xl border-dashed px-4 py-3 text-left"
        style={{ borderColor: "var(--accent)" }}
      >
        <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Quick question?</p>
        <p className="mt-1 text-sm font-semibold">◉ Ask ASTRA — answers instantly</p>
      </button>
    </div>
  );
}

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [stored, setStored] = useState(false);
  const [sending, setSending] = useState(false);
  const cls = "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none";
  const style = { borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" } as const;

  const openMailto = () => {
    const subject = encodeURIComponent(form.subject.trim() || "Hello Shivam — from your portfolio");
    const body = encodeURIComponent(
      `Hi Shivam,\n\n${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please add a valid email so Shivam can reply.");
    if (form.message.trim().length < 10) return setError("Please write a message of at least 10 characters.");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { stored?: boolean; mailtoFallback?: boolean };
      if (res.ok && data.stored) {
        setStored(true);
        setSent(true);
        return;
      }
      // No database configured yet (or a server error): fall back to mailto.
      openMailto();
      setStored(false);
      setSent(true);
    } catch {
      openMailto();
      setStored(false);
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--accent)", background: "var(--surface)" }} role="status">
        <p className="text-lg font-bold">{stored ? "Message received — thank you." : "Your mail app should now be open."}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {stored
            ? "Your message is stored in Shivam's inbox — he reads every inquiry personally and replies from there."
            : `This site's server inbox is not connected yet, so your message opens addressed to ${profile.email} — Shivam reads every inquiry personally and replies from there.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Your name</span>
          <input aria-label="Your name" className={cls} style={style} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Email</span>
          <input aria-label="Email" className={cls} style={style} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Subject</span>
        <input aria-label="Subject" className={cls} style={style} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Internship opportunity, collaboration, question…" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Message</span>
        <textarea aria-label="Message" className={cls} style={style} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      {error && <p className="text-sm" style={{ color: "#f87171" }} role="alert">{error}</p>}
      <button type="submit" disabled={sending} className="rounded-xl px-6 py-3 font-semibold" style={{ background: "var(--accent)", color: "#04101a" }}>
        {sending ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Sent to Shivam's inbox when the server is connected — otherwise it opens your mail app addressed to {profile.email}.
      </p>
    </form>
  );
}

/** The canonical contact surface: identical channels + form on the homepage and on /contact. */
export default function ContactSurface({ compact }: { compact?: boolean }) {
  return (
    <div>
      <ContactChannels compact={compact} />
      <div className="mt-6">
        <ContactForm />
      </div>
    </div>
  );
}
