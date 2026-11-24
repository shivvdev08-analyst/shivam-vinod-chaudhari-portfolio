import { profile } from "@/data/portfolio";

export const metadata = {
  title: "Owner Admin — Shivam Vinod Chaudhari",
};

export default function Admin() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>
        Restricted
      </p>
      <h1 className="mt-2 text-3xl font-extrabold">Owner Admin</h1>
      <p className="mt-4" style={{ color: "var(--muted)" }}>
        This is Shivam&apos;s admin entrance. The live admin console — content
        editing, the contact inbox, resume manager, analytics and the ASTRA
        knowledge base — is PIN-gated and runs on the Muse-hosted portfolio,
        because this public Vercel site is a static export with no server to
        verify a PIN or store changes.
      </p>
      <p className="mt-3" style={{ color: "var(--muted)" }}>
        Shivam: open the Muse app and tap <strong style={{ color: "var(--text)" }}>Admin</strong> in
        the header of your portfolio — the full console, with your PIN sign-in,
        is there. Everything you publish there flows into this public site on
        the next export.
      </p>
      <div className="card mt-8 p-5 text-sm" style={{ color: "var(--muted)" }}>
        <p>
          <strong style={{ color: "var(--text)" }}>What the console controls</strong>
        </p>
        <p className="mt-2">
          Projects &amp; case studies · Memories wall · Blog · Contact inbox ·
          Resume versions · ASTRA knowledge · Appearance &amp; themes ·
          Analytics — all behind the owner PIN, with sign-in attempts logged.
        </p>
      </div>
      <p className="mt-6 flex flex-wrap gap-3">
        <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20admin`}>
          Email Shivam
        </a>
        <a className="btn-ghost" href="/">
          ← Back to site
        </a>
      </p>
    </div>
  );
}
