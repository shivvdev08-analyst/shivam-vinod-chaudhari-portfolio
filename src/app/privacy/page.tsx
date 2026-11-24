import { profile } from "@/data/portfolio";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        <p>This portfolio is a public showcase of {profile.name}&apos;s work, education and contact details, published intentionally by him.</p>
        <p>This Vercel export does not run analytics, fingerprint visitors, or store contact messages on a server. The contact link opens your own mail app. Your theme choice is stored only in your own browser (localStorage).</p>
        <p>The Muse-hosted version of this portfolio records only real visitor events (page views, GitHub/demo clicks) for the owner&apos;s analytics dashboard, with no fingerprinting, and logs only the category of questions asked to ASTRA — never the conversation.</p>
        <p>Contact: <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
      </div>
    </div>
  );
}
