"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Status = {
  version: string;
  dbConfigured: boolean;
  pinSet: boolean;
  blobConfigured: boolean;
  adminReady: boolean;
};

type Row = Record<string, unknown>;

type Dashboard = {
  dbConfigured: boolean;
  dbError?: string;
  projects: Row[];
  messages: Row[];
  analytics: { totalEvents: number; byKind: Record<string, number>; recent: Row[] };
  audit: Row[];
  memories: Row[];
  knowledge: Row[];
};

const btn = "rounded-xl px-4 py-2.5 text-sm font-semibold";
const card = "card rounded-2xl p-5";

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fmtDate(v: unknown): string {
  if (typeof v !== "string") return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<"overview" | "inbox" | "content" | "knowledge">("overview");
  const [notice, setNotice] = useState("");
  const [setupBusy, setSetupBusy] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [hashOut, setHashOut] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status");
      const s = (await res.json()) as Status;
      setStatus(s);
      setLoadError("");
    } catch {
      setLoadError("Could not reach the server. The public site still works — this is the admin only.");
    }
  }, []);

  const refreshData = useCallback(async () => {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) { setAuthed(false); return; }
    const d = (await res.json()) as Dashboard;
    setData(d);
  }, []);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setPinError("");
    setSigningIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setPinError(d.message || "Sign-in failed.");
        return;
      }
      setPin("");
      setAuthed(true);
      await refreshData();
    } catch {
      setPinError("Could not reach the server. Try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setData(null);
  };

  const runSetup = async () => {
    setSetupBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; seededProjects?: number };
      if (!res.ok) { setNotice(d.message || "Setup failed."); return; }
      setNotice(`Tables created and verified content seeded (${d.seededProjects ?? 0} projects).`);
      await refreshData();
    } catch {
      setNotice("Setup could not reach the server.");
    } finally {
      setSetupBusy(false);
    }
  };

  const markMessage = async (id: number, next: string) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "message-status", id, status: next }),
    });
    await refreshData();
  };

  const addMemory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "memory",
        title: String(fd.get("title") || ""),
        story: String(fd.get("story") || ""),
        category: String(fd.get("category") || "academic"),
        place: String(fd.get("place") || ""),
        featured: fd.get("featured") === "on",
      }),
    });
    if (res.ok) { setNotice("Memory added."); e.currentTarget.reset(); await refreshData(); }
    else setNotice("Could not add the memory.");
  };

  const addKnowledge = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "knowledge", question: String(fd.get("question") || ""), answer: String(fd.get("answer") || ""), source: "Admin" }),
    });
    if (res.ok) { setNotice("Knowledge entry added — ASTRA can now answer it."); e.currentTarget.reset(); await refreshData(); }
    else setNotice("Could not add the knowledge entry.");
  };

  const uploadResume = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
    if (res.ok && d.url) { setNotice(`Resume uploaded: ${d.url}`); e.currentTarget.reset(); }
    else setNotice(d.message || "Upload failed — is a Blob store connected?");
  };

  if (!status) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Owner Admin</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{loadError || "Loading admin status…"}</p>
      </main>
    );
  }

  // --- PIN not configured yet: setup checklist + in-browser hash helper ---
  if (!status.pinSet) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Owner Admin — setup</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          The admin panel is ready, but no PIN is configured on this deployment yet. The public site is unaffected, and the Muse-hosted portfolio still works as the fallback admin.
        </p>
        <div className={`${card} mt-6 space-y-3 text-sm`}>
          <p className="font-semibold">To finish setup (free, no card):</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li><b>Database:</b> Vercel Dashboard → this project → Storage → Create Database → Neon → Free plan. This sets <code>DATABASE_URL</code> automatically.</li>
            <li><b>PIN:</b> choose a PIN privately, then paste its SHA-256 hash (below) into Vercel → Settings → Environment Variables as <code>ADMIN_PIN_HASH</code> (Production + Preview), and redeploy.</li>
            <li><b>Uploads (optional):</b> Storage → Create Store → Blob → Free plan. Sets <code>BLOB_READ_WRITE_TOKEN</code>.</li>
            <li>Come back here, sign in, and tap “Create tables &amp; seed content”.</li>
          </ol>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Full steps: <code>docs/VERCEL_NEON_ADMIN.md</code> in the repo. The PIN is never sent anywhere — the hash is computed in this browser only.</p>
        </div>
        <form
          className={`${card} mt-4 space-y-3`}
          onSubmit={async (e) => { e.preventDefault(); if (hashInput) setHashOut(await sha256Hex(hashInput)); }}
        >
          <label className="block text-sm font-semibold">PIN → SHA-256 hash (computed locally, never sent)</label>
          <input type="password" value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Type the PIN you chose" className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Compute hash</button>
          {hashOut && (
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Copy this into Vercel as <code>ADMIN_PIN_HASH</code>:</p>
              <code className="mt-1 block break-all rounded-lg border p-2 text-xs" style={{ borderColor: "var(--border)" }}>{hashOut}</code>
            </div>
          )}
        </form>
        <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Database: {status.dbConfigured ? "connected" : "not connected"} · Blob: {status.blobConfigured ? "connected" : "not connected"}</p>
      </main>
    );
  }

  // --- PIN login ---
  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold">Owner Admin</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Shivam only. Sign in with your PIN — 5 wrong attempts in 15 minutes locks sign-in, and attempts are logged.</p>
        <form onSubmit={login} className={`${card} mt-6 space-y-3`}>
          <label className="block text-sm font-semibold">PIN</label>
          <input type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter your PIN" className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
          {pinError && <p className="text-sm" style={{ color: "#f87171" }} role="alert">{pinError}</p>}
          <button type="submit" disabled={signingIn || !pin} className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{signingIn ? "Signing in…" : "Sign in"}</button>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Database: {status.dbConfigured ? "connected" : "not connected — sign-in works, but content and inbox need the Neon database (see docs/VERCEL_NEON_ADMIN.md)."}</p>
        </form>
      </main>
    );
  }

  // --- Dashboard ---
  const unread = data?.messages.filter((m) => m.status === "new").length ?? 0;
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Owner Admin</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Database: {status.dbConfigured ? "connected" : "not connected"} · Blob: {status.blobConfigured ? "connected" : "not connected"} · {data?.dbError ? `DB error: ${data.dbError}` : ""}
          </p>
        </div>
        <button onClick={logout} className={btn} style={{ border: "1px solid var(--border)" }}>Sign out</button>
      </div>
      {notice && <p className={`${card} mt-4 text-sm`} role="status">{notice}</p>}
      {status.dbConfigured && (
        <div className="mt-4">
          <button onClick={runSetup} disabled={setupBusy} className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{setupBusy ? "Setting up…" : "Create tables & seed content"}</button>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {(["overview", "inbox", "content", "knowledge"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={btn} style={tab === t ? { background: "var(--accent)", color: "#04101a" } : { border: "1px solid var(--border)" }}>
            {t === "overview" ? "Overview" : t === "inbox" ? `Inbox${unread ? ` (${unread})` : ""}` : t === "content" ? "Content" : "ASTRA knowledge"}
          </button>
        ))}
        <button onClick={() => void refreshData()} className={btn} style={{ border: "1px solid var(--border)" }}>Refresh</button>
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Projects</p><p className="mt-1 text-3xl font-bold">{data?.projects.length ?? "—"}</p></div>
          <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>New messages</p><p className="mt-1 text-3xl font-bold">{unread}</p></div>
          <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Analytics events</p><p className="mt-1 text-3xl font-bold">{data?.analytics.totalEvents ?? "—"}</p><p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{Object.entries(data?.analytics.byKind ?? {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No events yet"}</p></div>
          <div className={`${card} sm:col-span-3`}>
            <p className="font-semibold">Recent activity</p>
            <ul className="mt-2 space-y-1 text-sm">{(data?.audit ?? []).slice(0, 8).map((a, i) => <li key={i}>{String(a.action)} — {String(a.detail || "")} · {fmtDate(a.created_at)}</li>)}{!(data?.audit?.length) && <li style={{ color: "var(--muted)" }}>No activity logged yet.</li>}</ul>
          </div>
        </div>
      )}

      {tab === "inbox" && (
        <div className="mt-6 space-y-3">
          {!(data?.messages.length) && <p className={`${card} text-sm`} style={{ color: "var(--muted)" }}>No messages yet. When the Neon database is connected, contact-form messages land here; until then the form falls back to email.</p>}
          {data?.messages.map((m) => (
            <article key={String(m.id)} className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{String(m.name)} &lt;{String(m.email)}&gt;</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{fmtDate(m.created_at)} · {String(m.status)}</p>
              </div>
              <p className="mt-1 text-sm font-medium">{String(m.subject || "(no subject)")}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{String(m.message)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => void markMessage(Number(m.id), "read")} className={btn} style={{ border: "1px solid var(--border)" }}>Mark read</button>
                <button onClick={() => void markMessage(Number(m.id), "replied")} className={btn} style={{ border: "1px solid var(--border)" }}>Mark replied</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <p className="font-semibold">Projects ({data?.projects.length ?? 0})</p>
            <ul className="mt-2 space-y-1 text-sm">{data?.projects.map((p) => <li key={String(p.slug)}>{String(p.title)} — <span style={{ color: "var(--muted)" }}>{String(p.status)}</span></li>)}</ul>
            <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>Project editing from the database is next; the seeded list above comes from the verified portfolio data.</p>
          </div>
          <div className={card}>
            <p className="font-semibold">Memories ({data?.memories.length ?? 0})</p>
            <ul className="mt-2 space-y-1 text-sm">{data?.memories.map((m, i) => <li key={i}>{String(m.title)} {m.featured ? "· featured" : ""}</li>)}</ul>
            <form onSubmit={addMemory} className="mt-4 space-y-2">
              <p className="text-sm font-semibold">Add a memory (verified details only)</p>
              <input name="title" required placeholder="Title" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              <textarea name="story" required placeholder="What happened — only what you can verify" rows={3} className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              <div className="flex gap-2">
                <input name="place" placeholder="Place (optional)" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                <select name="category" className="rounded-xl border px-2 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}><option value="academic">Academic</option><option value="personal">Personal</option></select>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
              <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Add memory</button>
            </form>
          </div>
          <div className={`${card} lg:col-span-2`}>
            <p className="font-semibold">Upload resume (PDF)</p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{status.blobConfigured ? "Uploads to Vercel Blob and records the file in the resumes table." : "Needs a Blob store (Vercel Dashboard → Storage → Create Store → Blob, free). The existing repo PDF stays the public download until then."}</p>
            <form onSubmit={uploadResume} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="kind" value="resume" />
              <input type="file" name="file" accept="application/pdf" required className="text-sm" />
              <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Upload PDF</button>
            </form>
          </div>
        </div>
      )}

      {tab === "knowledge" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <p className="font-semibold">ASTRA knowledge ({data?.knowledge.length ?? 0})</p>
            <ul className="mt-2 space-y-2 text-sm">{data?.knowledge.map((k) => <li key={String(k.id)}><b>{String(k.question)}</b><br /><span style={{ color: "var(--muted)" }}>{String(k.answer)}</span></li>)}{!(data?.knowledge.length) && <li style={{ color: "var(--muted)" }}>Seeded from the portfolio FAQ once setup runs.</li>}</ul>
          </div>
          <form onSubmit={addKnowledge} className={`${card} space-y-2`}>
            <p className="font-semibold">Add a Q&amp;A ASTRA may answer</p>
            <input name="question" required placeholder="Question" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            <textarea name="answer" required placeholder="Answer — only verified facts" rows={4} className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Add entry</button>
          </form>
        </div>
      )}
    </main>
  );
}
