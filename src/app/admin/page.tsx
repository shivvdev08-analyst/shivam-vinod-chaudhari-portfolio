"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";

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
  skills: Row[];
  profile: { name: string; role: string; tagline: string; intro: string; location: string; availability: string; photo_url: string };
  agentforge: Row[];
  blogPosts: Row[];
  resumes: Row[];
  settings: Record<string, string>;
  messages: Row[];
  analytics: { totalEvents: number; byKind: Record<string, number>; recent: Row[] };
  audit: Row[];
  memories: Row[];
  knowledge: Row[];
};

const TABS = [
  ["overview", "Overview"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["profile", "Profile & Photo"],
  ["agentforge", "AgentForge"],
  ["memories", "Memories"],
  ["blog", "Blog"],
  ["inbox", "Inbox"],
  ["resume", "Resume"],
  ["knowledge", "ASTRA Knowledge"],
  ["appearance", "Appearance & SEO"],
  ["analytics", "Analytics"],
  ["copilot", "Muse Copilot"],
  ["system", "System"],
] as const;
type TabId = (typeof TABS)[number][0];

const btn = "rounded-xl px-4 py-2.5 text-sm font-semibold";
const card = "card rounded-2xl p-5";
const inputCls = "w-full rounded-xl border px-3 py-2 text-sm outline-none";
const inputStyle = { borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" } as const;

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fmtDate(v: unknown): string {
  if (typeof v !== "string") return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function str(r: Row, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function DbBanner({ dbConfigured }: { dbConfigured: boolean }) {
  if (dbConfigured) return null;
  return (
    <p className={`${card} mt-4 text-sm`} role="status" style={{ borderColor: "#f59e0b" }}>
      <b>Database not connected.</b> You can browse the seeded lists below, but edits cannot persist yet — create the free Neon
      database in Vercel Dashboard → Storage → Create Database → Neon → Free plan, redeploy, then come back and tap
      “Create tables &amp; seed content”. Nothing you save here is silently lost: saves return an error until the database is connected.
    </p>
  );
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [notice, setNotice] = useState("");
  const [setupBusy, setSetupBusy] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [hashOut, setHashOut] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status", { cache: "no-store" });
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

  // Generic CRUD save: posts one type to /api/admin/data, shows an honest
  // result, and refreshes. A 503 means the Neon database is not connected.
  const save = async (payload: Record<string, unknown>, okMsg: string): Promise<boolean> => {
    setNotice("");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setNotice(d.error === "DB_NOT_CONFIGURED"
          ? "Not saved — the Neon database is not connected yet. Create it in Vercel Dashboard → Storage → Neon (Free), redeploy, then try again."
          : d.message || "Save failed. Nothing was changed.");
        return false;
      }
      setNotice(okMsg);
      await refreshData();
      return true;
    } catch {
      setNotice("Save could not reach the server.");
      return false;
    }
  };

  const remove = async (payload: Record<string, unknown>, label: string) => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    await save(payload, `${label} deleted.`);
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
        <div className={`${card} mt-6 space-y-1 text-sm`} role="status">
          <p className="font-semibold">Live status (checked just now):</p>
          <p>✗ PIN: not configured — this page stays until a PIN hash is saved and redeployed</p>
          <p>{status.dbConfigured ? "✓" : "✗"} Database: {status.dbConfigured ? "connected" : "not connected"}</p>
          <p>{status.blobConfigured ? "✓" : "✗"} Blob uploads: {status.blobConfigured ? "connected" : "not connected"}</p>
          <button onClick={() => void refreshStatus()} className={`${btn} mt-2`} style={{ border: "1px solid var(--border)" }}>Refresh status</button>
        </div>
        <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
          Just saved the PIN and redeployed but still seeing this page? Env vars only apply to a <b>new deployment</b> — save, then redeploy (Deployments → latest → Redeploy), then hard-refresh this page (Ctrl+Shift+R / Cmd+Shift+R). If it still says “not configured”, check in Vercel → Settings → Environment Variables that the Key is exactly <code>ADMIN_PIN_HASH</code> (with underscores — <code>ADMINPINHASH</code> does not count), the Value is the 64-character SHA-256 hash (not your PIN itself), and it is enabled for Production.
        </p>
        <div className={`${card} mt-6 space-y-3 text-sm`}>
          <p className="font-semibold">To finish setup (free, no card):</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li><b>Database:</b> Vercel Dashboard → this project → Storage → Create Database → Neon → Free plan. This sets <code>DATABASE_URL</code> automatically.</li>
            <li><b>PIN:</b> choose a PIN privately, then paste its SHA-256 hash (below) into Vercel → Settings → Environment Variables as <code>ADMIN_PIN_HASH</code> (Production + Preview), and redeploy.</li>
            <li><b>Uploads (optional):</b> Storage → Create Store → Blob → Free plan. Sets <code>BLOB_READ_WRITE_TOKEN</code>.</li>
            <li>Come back here, sign in, and tap “Create tables &amp; seed content”.</li>
          </ol>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Full steps: <code>docs/VERCEL_NEON_ADMIN.md</code> in the repo. The PIN is never sent anywhere — the hash is computed in this browser only. The PIN login form appears as soon as the hash is saved and redeployed — the database is only needed for the inbox, content and analytics, not for signing in.</p>
        </div>
        <form
          className={`${card} mt-4 space-y-3`}
          onSubmit={async (e) => { e.preventDefault(); if (hashInput) setHashOut(await sha256Hex(hashInput)); }}
        >
          <label className="block text-sm font-semibold">PIN → SHA-256 hash (computed locally, never sent)</label>
          <input type="password" value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Type the PIN you chose" className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Compute hash</button>
          {hashOut && (
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Copy this into Vercel as <code>ADMIN_PIN_HASH</code>:</p>
              <code className="mt-1 block break-all rounded-lg border p-2 text-xs" style={{ borderColor: "var(--border)" }}>{hashOut}</code>
            </div>
          )}
        </form>
        <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>PIN: ✗ not configured · Database: {status.dbConfigured ? "✓ connected" : "✗ not connected"} · Blob: {status.blobConfigured ? "✓ connected" : "✗ not connected"}</p>
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
          <input type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter your PIN" className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
          {pinError && <p className="text-sm" style={{ color: "#f87171" }} role="alert">{pinError}</p>}
          <button type="submit" disabled={signingIn || !pin} className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{signingIn ? "Signing in…" : "Sign in"}</button>
          <p className="text-xs" style={{ color: "var(--muted)" }}>PIN: ✓ configured · Database: {status.dbConfigured ? "✓ connected" : "✗ not connected — sign-in works, but content and inbox need the Neon database (see docs/VERCEL_NEON_ADMIN.md)."} · Blob: {status.blobConfigured ? "✓ connected" : "✗ not connected"}</p>
        </form>
      </main>
    );
  }

  // --- Dashboard ---
  const unread = data?.messages.filter((m) => str(m, "status") === "new").length ?? 0;
  const d = data;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Owner Admin</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Database: {status.dbConfigured ? "connected" : "not connected"} · Blob: {status.blobConfigured ? "connected" : "not connected"}
            {d?.dbError ? ` · DB error: ${d.dbError}` : ""}
          </p>
        </div>
        <button onClick={logout} className={btn} style={{ border: "1px solid var(--border)" }}>Sign out</button>
      </div>
      {notice && <p className={`${card} mt-4 text-sm`} role="status">{notice}</p>}
      <DbBanner dbConfigured={status.dbConfigured} />
      {status.dbConfigured && (
        <div className="mt-4">
          <button onClick={runSetup} disabled={setupBusy} className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{setupBusy ? "Setting up…" : "Create tables & seed content"}</button>
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Admin modules" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`${btn} shrink-0 text-left`}
              style={tab === id ? { background: "var(--accent)", color: "#04101a" } : { border: "1px solid var(--border)" }}
            >
              {label}{id === "inbox" && unread ? ` (${unread})` : ""}
            </button>
          ))}
          <button onClick={() => void refreshData()} className={`${btn} shrink-0 text-left`} style={{ border: "1px solid var(--border)" }}>Refresh data</button>
        </nav>
        <div className="min-w-0">
          {tab === "overview" && <OverviewTab d={d} go={setTab} />}
          {tab === "projects" && <ProjectsTab d={d} save={save} remove={remove} />}
          {tab === "skills" && <SkillsTab d={d} save={save} remove={remove} />}
          {tab === "profile" && <ProfileTab d={d} status={status} save={save} />}
          {tab === "agentforge" && <AgentForgeTab d={d} save={save} remove={remove} />}
          {tab === "memories" && <MemoriesTab d={d} save={save} remove={remove} />}
          {tab === "blog" && <BlogTab d={d} save={save} remove={remove} />}
          {tab === "inbox" && <InboxTab d={d} save={save} />}
          {tab === "resume" && <ResumeTab d={d} status={status} />}
          {tab === "knowledge" && <KnowledgeTab d={d} save={save} remove={remove} />}
          {tab === "appearance" && <AppearanceTab d={d} save={save} />}
          {tab === "analytics" && <AnalyticsTab d={d} />}
          {tab === "copilot" && <CopilotTab save={save} />}
          {tab === "system" && <SystemTab d={d} status={status} runSetup={runSetup} setupBusy={setupBusy} />}
        </div>
      </div>
    </main>
  );
}

type SaveFn = (payload: Record<string, unknown>, okMsg: string) => Promise<boolean>;
type RemoveFn = (payload: Record<string, unknown>, label: string) => Promise<void>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function OverviewTab({ d, go }: { d: Dashboard | null; go: (t: TabId) => void }) {
  const unread = d?.messages.filter((m) => str(m, "status") === "new").length ?? 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Projects</p><p className="mt-1 text-3xl font-bold">{d?.projects.length ?? "—"}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Skills</p><p className="mt-1 text-3xl font-bold">{d?.skills.length ?? "—"}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>New messages</p><p className="mt-1 text-3xl font-bold">{unread}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Memories</p><p className="mt-1 text-3xl font-bold">{d?.memories.length ?? "—"}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Blog posts</p><p className="mt-1 text-3xl font-bold">{d?.blogPosts.length ?? "—"}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Analytics events</p><p className="mt-1 text-3xl font-bold">{d?.analytics.totalEvents ?? "—"}</p><p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{Object.entries(d?.analytics.byKind ?? {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No events yet"}</p></div>
      </div>
      <div className={card}>
        <p className="font-semibold">Recent activity</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(d?.audit ?? []).slice(0, 8).map((a, i) => <li key={i}>{str(a, "action")} — {str(a, "detail")} · {fmtDate(a.created_at)}</li>)}
          {!(d?.audit?.length) && <li style={{ color: "var(--muted)" }}>No activity logged yet. Activity appears once the Neon database is connected.</li>}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => go("projects")} className={btn} style={{ border: "1px solid var(--border)" }}>Manage projects</button>
        <button onClick={() => go("inbox")} className={btn} style={{ border: "1px solid var(--border)" }}>Open inbox</button>
        <button onClick={() => go("profile")} className={btn} style={{ border: "1px solid var(--border)" }}>Edit profile &amp; photo</button>
      </div>
      {!d?.dbConfigured && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Counts above come from the verified portfolio data built into the site. They become live database counts after “Create tables &amp; seed content” runs.</p>
      )}
    </div>
  );
}

function ProjectsTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  const empty = { slug: "", title: "", tagline: "", category: "AI", status: "in-development", team: "Solo project", stack: "", github_url: "", description: "", published: true };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await save({ type: "project", ...form }, editing ? "Project updated." : "Project added.");
    if (ok) { setForm(empty); setEditing(false); }
  };
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="font-semibold">Projects ({d?.projects.length ?? 0})</p>
        <ul className="mt-2 space-y-2 text-sm">
          {(d?.projects ?? []).map((p) => (
            <li key={str(p, "slug")} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span><b>{str(p, "title")}</b> — <span style={{ color: "var(--muted)" }}>{str(p, "status")} · {str(p, "category")}</span><br /><span style={{ color: "var(--muted)" }}>{str(p, "tagline")}</span></span>
              <span className="flex gap-2">
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => {
                  setEditing(true);
                  setForm({ slug: str(p, "slug"), title: str(p, "title"), tagline: str(p, "tagline"), category: str(p, "category") || "AI", status: str(p, "status") || "in-development", team: "Solo project", stack: Array.isArray(p.stack) ? (p.stack as string[]).join(", ") : "", github_url: str(p, "github_url"), description: "", published: p.published !== false });
                }}>Edit</button>
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => void remove({ type: "project-delete", slug: str(p, "slug") }, str(p, "title"))}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <p className="font-semibold">{editing ? "Edit project" : "Add a project"}</p>
        <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Tagline"><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} style={inputStyle} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls} style={inputStyle}>
              <option value="completed">Completed</option><option value="in-development">In development</option><option value="planning">Planning</option>
            </select>
          </Field>
          <Field label="Team"><input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        </div>
        <Field label="Stack (comma separated)"><input value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} placeholder="Python, FastAPI, PostgreSQL" className={inputCls} style={inputStyle} /></Field>
        <Field label="GitHub URL"><input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
        <div className="flex gap-2">
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{editing ? "Save changes" : "Add project"}</button>
          {editing && <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => { setForm(empty); setEditing(false); }}>Cancel</button>}
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>Only verified facts: no invented results, dates or responsibilities. The public site reads its project list from the built-in portfolio data until the database-backed list is wired in — your edits are stored in Neon and listed here first.</p>
      </form>
    </div>
  );
}

function SkillsTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  const [form, setForm] = useState({ id: 0, name: "", category: "AI & Machine Learning", level: "" });
  const [editing, setEditing] = useState(false);
  const groups: Record<string, Row[]> = {};
  for (const s of d?.skills ?? []) { const c = str(s, "category") || "General"; (groups[c] ??= []).push(s); }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await save({ type: "skill", ...(editing && form.id > 0 ? { id: form.id } : {}), name: form.name, category: form.category, level: form.level }, editing ? "Skill updated." : "Skill added.");
    if (ok) { setForm({ id: 0, name: "", category: "AI & Machine Learning", level: "" }); setEditing(false); }
  };
  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([cat, list]) => (
        <div key={cat} className={card}>
          <p className="font-semibold">{cat} ({list.length})</p>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {list.map((s) => (
              <li key={String(s.id || s.name)} className="flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: "var(--border)" }}>
                {str(s, "name")}{str(s, "level") ? ` · ${str(s, "level")}` : ""}
                <button type="button" className="underline" onClick={() => { setEditing(true); setForm({ id: Number(s.id) || 0, name: str(s, "name"), category: cat, level: str(s, "level") }); }}>Edit</button>
                {Number(s.id) > 0 && <button type="button" className="underline" onClick={() => void remove({ type: "skill-delete", id: Number(s.id) }, str(s, "name"))}>Delete</button>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <p className="font-semibold">{editing ? "Edit skill" : "Add a skill"}</p>
        <Field label="Skill name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. FastAPI" className={inputCls} style={inputStyle} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} style={inputStyle} /></Field>
          <Field label="Level">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inputCls} style={inputStyle}>
              <option value="">—</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{editing ? "Save changes" : "Add skill"}</button>
          {editing && <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => { setForm({ id: 0, name: "", category: "AI & Machine Learning", level: "" }); setEditing(false); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

function ProfileTab({ d, status, save }: { d: Dashboard | null; status: Status; save: SaveFn }) {
  const p = d?.profile ?? { name: "", role: "", tagline: "", intro: "", location: "", availability: "", photo_url: "" };
  const [form, setForm] = useState(p);
  const [photoMsg, setPhotoMsg] = useState("");
  useEffect(() => { setForm(p); }, [d?.profile?.name]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await save({ type: "settings", settings: {
      "profile.name": form.name, "profile.role": form.role, "profile.tagline": form.tagline,
      "profile.intro": form.intro, "profile.location": form.location, "profile.availability": form.availability,
      "profile.photo_url": form.photo_url,
    } }, "Profile saved.");
  };
  const uploadPhoto = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhotoMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
    if (res.ok && data.url) {
      setForm({ ...form, photo_url: data.url });
      setPhotoMsg(`Photo uploaded to Blob: ${data.url} — tap “Save profile” to store the URL.`);
      e.currentTarget.reset();
    } else setPhotoMsg(data.message || "Upload failed — is a Blob store connected?");
  };
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <p className="font-semibold">Profile</p>
        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Role / headline"><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Tagline"><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Intro"><textarea rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} style={inputStyle} /></Field>
          <Field label="Availability"><input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        </div>
        <Field label="Photo URL (Blob)"><input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="Upload a photo below, or paste a URL" className={inputCls} style={inputStyle} /></Field>
        <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Save profile</button>
      </form>
      <div className={card}>
        <p className="font-semibold">Profile photo</p>
        {form.photo_url && <p className="mt-2 text-sm break-all" style={{ color: "var(--muted)" }}>Current: {form.photo_url}</p>}
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          {status.blobConfigured ? "Uploads to Vercel Blob and stores the URL above." : "Needs a Blob store (Vercel Dashboard → Storage → Create Store → Blob, free)."}
          {" "}Note: the public homepage hero photo still comes from <code>public/photo.jpg</code> in the GitHub repo — upload your real photo there in GitHub web to change the hero. A Blob photo is stored for the admin profile and future use.
        </p>
        <form onSubmit={uploadPhoto} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="kind" value="photo" />
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Upload photo</button>
        </form>
        {photoMsg && <p className="mt-2 text-sm break-all" role="status">{photoMsg}</p>}
      </div>
    </div>
  );
}

function AgentForgeTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  const empty = { slug: "", title: "", tagline: "", status: "planning", stack: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await save({ type: "agentforge", ...form }, editing ? "AgentForge node updated." : "AgentForge node added.");
    if (ok) { setForm(empty); setEditing(false); }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--muted)" }}>The AgentForge ecosystem map. VERITAS is deliberately not a node here — it is the separate MCA capstone. The planned outer ring is for future agents, added only when they exist.</p>
      <div className={card}>
        <p className="font-semibold">Nodes ({d?.agentforge.length ?? 0})</p>
        <ul className="mt-2 space-y-2 text-sm">
          {(d?.agentforge ?? []).map((n) => (
            <li key={str(n, "slug")} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span><b>{str(n, "title")}</b> — <span style={{ color: "var(--muted)" }}>{str(n, "status")}</span><br /><span style={{ color: "var(--muted)" }}>{str(n, "tagline")}</span></span>
              <span className="flex gap-2">
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => {
                  setEditing(true);
                  setForm({ slug: str(n, "slug"), title: str(n, "title"), tagline: str(n, "tagline"), status: str(n, "status") || "planning", stack: Array.isArray(n.stack) ? (n.stack as string[]).join(", ") : "", description: str(n, "description"), sort_order: Number(n.sort_order) || 0 });
                }}>Edit</button>
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => void remove({ type: "agentforge-delete", slug: str(n, "slug") }, str(n, "title"))}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <p className="font-semibold">{editing ? "Edit node" : "Add a node"}</p>
        <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Tagline"><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls} style={inputStyle}>
              <option value="completed">Completed</option><option value="in-development">In development</option><option value="in-progress">In progress</option><option value="planning">Planning</option>
            </select>
          </Field>
          <Field label="Order"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} style={inputStyle} /></Field>
        </div>
        <Field label="Stack (comma separated)"><input value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="flex gap-2">
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{editing ? "Save changes" : "Add node"}</button>
          {editing && <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => { setForm(empty); setEditing(false); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

function MemoriesTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="font-semibold">Memories ({d?.memories.length ?? 0})</p>
        <ul className="mt-2 space-y-2 text-sm">
          {(d?.memories ?? []).map((m, i) => (
            <li key={String(m.id ?? i)} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span><b>{str(m, "title")}</b>{m.featured ? " · featured" : ""} <span style={{ color: "var(--muted)" }}>— {str(m, "category")}</span></span>
              {typeof m.id === "number" && <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => void remove({ type: "memory-delete", id: Number(m.id) }, str(m, "title"))}>Delete</button>}
            </li>
          ))}
        </ul>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const ok = await save({ type: "memory", title: String(fd.get("title") || ""), story: String(fd.get("story") || ""), category: String(fd.get("category") || "academic"), place: String(fd.get("place") || ""), featured: fd.get("featured") === "on" }, "Memory added.");
          if (ok) e.currentTarget.reset();
        }}
        className={`${card} space-y-3`}
      >
        <p className="font-semibold">Add a memory (verified details only)</p>
        <Field label="Title"><input name="title" required placeholder="e.g. Data4Viz — First Position" className={inputCls} style={inputStyle} /></Field>
        <Field label="Story"><textarea name="story" required placeholder="What happened — only what you can verify" rows={3} className={inputCls} style={inputStyle} /></Field>
        <div className="flex gap-2">
          <input name="place" placeholder="Place (optional)" className={inputCls} style={inputStyle} />
          <select name="category" className="rounded-xl border px-2 py-2 text-sm" style={inputStyle}><option value="academic">Academic</option><option value="personal">Personal</option></select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Add memory</button>
        <p className="text-xs" style={{ color: "var(--muted)" }}>Do not invent dates or details for Techfest or other visits — leave those for Shivam to add with verified facts.</p>
      </form>
    </div>
  );
}

function BlogTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  const empty = { slug: "", title: "", category: "Notes", tags: "", status: "draft", body: "" };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await save({ type: "blog", ...form }, editing ? "Post updated." : "Post saved as draft.");
    if (ok) { setForm(empty); setEditing(false); }
  };
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="font-semibold">Blog posts ({d?.blogPosts.length ?? 0})</p>
        {!(d?.blogPosts.length) && <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>No posts in the database yet. Drafts you save here stay drafts until you publish them.</p>}
        <ul className="mt-2 space-y-2 text-sm">
          {(d?.blogPosts ?? []).map((p) => (
            <li key={str(p, "slug")} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span><b>{str(p, "title")}</b> — <span style={{ color: "var(--muted)" }}>{str(p, "status")} · {str(p, "category")}</span></span>
              <span className="flex gap-2">
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => {
                  setEditing(true);
                  setForm({ slug: str(p, "slug"), title: str(p, "title"), category: str(p, "category") || "Notes", tags: Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "", status: str(p, "status") || "draft", body: str(p, "body") });
                }}>Edit</button>
                <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => void remove({ type: "blog-delete", slug: str(p, "slug") }, str(p, "title"))}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <p className="font-semibold">{editing ? "Edit post" : "New post"}</p>
        <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} style={inputStyle} /></Field>
          <Field label="Tags (comma separated)"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} style={inputStyle} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls} style={inputStyle}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Body"><textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <div className="flex gap-2">
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>{editing ? "Save changes" : "Save post"}</button>
          {editing && <button type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => { setForm(empty); setEditing(false); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

function InboxTab({ d, save }: { d: Dashboard | null; save: SaveFn }) {
  return (
    <div className="space-y-3">
      {!(d?.messages.length) && <p className={`${card} text-sm`} style={{ color: "var(--muted)" }}>No messages yet. When the Neon database is connected, contact-form messages land here; until then the form falls back to email.</p>}
      {(d?.messages ?? []).map((m) => (
        <article key={String(m.id)} className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{str(m, "name")} &lt;{str(m, "email")}&gt;</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{fmtDate(m.created_at)} · {str(m, "status")}</p>
          </div>
          <p className="mt-1 text-sm font-medium">{str(m, "subject") || "(no subject)"}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{str(m, "message")}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => void save({ type: "message-status", id: Number(m.id), status: "read" }, "Marked read.")} className={btn} style={{ border: "1px solid var(--border)" }}>Mark read</button>
            <button onClick={() => void save({ type: "message-status", id: Number(m.id), status: "replied" }, "Marked replied.")} className={btn} style={{ border: "1px solid var(--border)" }}>Mark replied</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ResumeTab({ d, status }: { d: Dashboard | null; status: Status }) {
  const [msg, setMsg] = useState("");
  const upload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
    if (res.ok && data.url) { setMsg(`Resume uploaded: ${data.url}`); e.currentTarget.reset(); }
    else setMsg(data.message || "Upload failed — is a Blob store connected?");
  };
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="font-semibold">Uploaded resumes ({d?.resumes.length ?? 0})</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(d?.resumes ?? []).map((r) => <li key={String(r.id)}><a href={str(r, "blob_url")} target="_blank" rel="noreferrer" className="underline">{str(r, "label")}</a> {r.is_default ? "· default" : ""} · {fmtDate(r.created_at)}</li>)}
          {!(d?.resumes.length) && <li style={{ color: "var(--muted)" }}>None uploaded through the admin yet.</li>}
        </ul>
      </div>
      <div className={card}>
        <p className="font-semibold">Upload resume (PDF)</p>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          {status.blobConfigured ? "Uploads to Vercel Blob and records the file above. The public download button is free for visitors — no sign-in needed." : "Needs a Blob store (Vercel Dashboard → Storage → Create Store → Blob, free). The existing repo PDF stays the public download until then."}
        </p>
        <form onSubmit={upload} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="kind" value="resume" />
          <input type="file" name="file" accept="application/pdf" required className="text-sm" />
          <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Upload PDF</button>
        </form>
        {msg && <p className="mt-2 text-sm break-all" role="status">{msg}</p>}
      </div>
    </div>
  );
}

function KnowledgeTab({ d, save, remove }: { d: Dashboard | null; save: SaveFn; remove: RemoveFn }) {
  return (
    <div className="mt-0 grid gap-4 lg:grid-cols-2">
      <div className={card}>
        <p className="font-semibold">ASTRA knowledge ({d?.knowledge.length ?? 0})</p>
        <ul className="mt-2 space-y-2 text-sm">
          {(d?.knowledge ?? []).map((k) => (
            <li key={String(k.id)} className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <b>{str(k, "question")}</b><br /><span style={{ color: "var(--muted)" }}>{str(k, "answer")}</span>
              <span className="mt-1 block"><button type="button" className="underline" onClick={() => void remove({ type: "knowledge-delete", id: Number(k.id) }, str(k, "question"))}>Delete</button></span>
            </li>
          ))}
          {!(d?.knowledge.length) && <li style={{ color: "var(--muted)" }}>Seeded from the portfolio FAQ once setup runs.</li>}
        </ul>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const ok = await save({ type: "knowledge", question: String(fd.get("question") || ""), answer: String(fd.get("answer") || ""), source: "Admin" }, "Knowledge entry added — ASTRA can now answer it.");
          if (ok) e.currentTarget.reset();
        }}
        className={`${card} space-y-2`}
      >
        <p className="font-semibold">Add a Q&amp;A ASTRA may answer</p>
        <input name="question" required placeholder="Question" className={inputCls} style={inputStyle} />
        <textarea name="answer" required placeholder="Answer — only verified facts" rows={4} className={inputCls} style={inputStyle} />
        <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Add entry</button>
      </form>
    </div>
  );
}

function AppearanceTab({ d, save }: { d: Dashboard | null; save: SaveFn }) {
  const s = d?.settings ?? {};
  const [theme, setTheme] = useState(s["appearance.default_theme"] || "aurora");
  const [seoTitle, setSeoTitle] = useState(s["seo.title"] || "");
  const [seoDesc, setSeoDesc] = useState(s["seo.description"] || "");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await save({ type: "settings", settings: { "appearance.default_theme": theme, "seo.title": seoTitle, "seo.description": seoDesc } }, "Appearance & SEO saved.");
      }}
      className={`${card} space-y-3`}
    >
      <p className="font-semibold">Appearance &amp; SEO</p>
      <Field label="Default theme (first visit)">
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className={inputCls} style={inputStyle}>
          <option value="aurora">Aurora — teal / violet / emerald</option>
          <option value="verdant">Verdant</option>
          <option value="solar">Solar Forge</option>
          <option value="ultraviolet">Ultraviolet</option>
        </select>
      </Field>
      <Field label="SEO title"><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} style={inputStyle} /></Field>
      <Field label="SEO description"><textarea rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className={inputCls} style={inputStyle} /></Field>
      <button type="submit" className={btn} style={{ background: "var(--accent)", color: "#04101a" }}>Save appearance</button>
      <p className="text-xs" style={{ color: "var(--muted)" }}>Saved in the admin database. Visitors can still switch themes from the header; this sets the first-visit default. The public site reads this setting once the theme wiring is connected — until then Aurora remains the built-in default.</p>
    </form>
  );
}

function AnalyticsTab({ d }: { d: Dashboard | null }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>Total events</p><p className="mt-1 text-3xl font-bold">{d?.analytics.totalEvents ?? "—"}</p></div>
        <div className={card}><p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>By kind</p><p className="mt-1 text-sm">{Object.entries(d?.analytics.byKind ?? {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No events yet"}</p></div>
      </div>
      <div className={card}>
        <p className="font-semibold">Recent events</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(d?.analytics.recent ?? []).map((r, i) => <li key={i}>{str(r, "kind")} — {str(r, "path")} · {fmtDate(r.created_at)}</li>)}
          {!(d?.analytics.recent?.length) && <li style={{ color: "var(--muted)" }}>No events logged yet. Events are recorded once the Neon database is connected.</li>}
        </ul>
      </div>
      <div className={card}>
        <p className="font-semibold">Audit log</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(d?.audit ?? []).slice(0, 20).map((a, i) => <li key={i}>{str(a, "action")} — {str(a, "detail")} · {fmtDate(a.created_at)}</li>)}
          {!(d?.audit?.length) && <li style={{ color: "var(--muted)" }}>No activity logged yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function CopilotTab({ save }: { save: SaveFn }) {
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState("");
  const templates = [
    ["Improve my About intro", "About intro"],
    ["Draft a project summary", "Project summary"],
    ["Draft a blog outline", "Blog outline"],
  ] as const;
  const generate = (kind: string) => {
    const t = topic || "my portfolio";
    if (kind === "About intro") {
      setDraft(`Draft — About intro (edit before using)\n\nShivam Vinod Chaudhari is an aspiring AI Engineer & Full-Stack Developer from Pune — MCA (2025–2027) at Dr. D. Y. Patil Dnyan Prasad Global University, CGPA 9.09, and BCA from Moolji Jetha Autonomous College, Jalgaon, CGPA 8.33. He builds intelligent software: ASTRA, a voice-first personal AI companion; VERITAS, a multimodal document intelligence capstone with Divya Padukone; and SafeGen AI, a self-reflective framework for evaluating LLM outputs. Topic: ${t}.`);
    } else if (kind === "Project summary") {
      setDraft(`Draft — Project summary (edit before using)\n\nProject: ${t}\n\nProblem: what it solves, in one line.\nWhat I built: the approach, the stack, and what is actually working today.\nStatus: completed / in development / planning — label it honestly.\nWhat I learned: one concrete lesson from building it.`);
    } else {
      setDraft(`Draft — Blog outline (edit before using)\n\nTitle: ${t}\n\n1. The problem I ran into\n2. What I tried first — and why it did not work\n3. What I built instead (stack, approach)\n4. What I would do differently next time\n5. What is next`);
    }
  };
  return (
    <div className={`${card} space-y-3`}>
      <p className="font-semibold">Muse Admin Copilot — drafts only</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Copilot drafts text from your verified portfolio facts. Nothing is published automatically — you review every draft here first, then save it yourself as a blog post or profile edit. (On Vercel this is a local template draft, not the live Muse chat copilot.)</p>
      <Field label="Topic"><input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. SafeGen AI, VERITAS, my MCA journey" className={inputCls} style={inputStyle} /></Field>
      <div className="flex flex-wrap gap-2">
        {templates.map(([label, kind]) => (
          <button key={kind} type="button" className={btn} style={{ border: "1px solid var(--border)" }} onClick={() => generate(kind)}>{label}</button>
        ))}
      </div>
      {draft && (
        <>
          <textarea rows={10} value={draft} onChange={(e) => setDraft(e.target.value)} className={inputCls} style={inputStyle} />
          <button type="button" className={btn} style={{ background: "var(--accent)", color: "#04101a" }} onClick={() => void save({ type: "blog", title: topic ? `Draft: ${topic}` : "Draft", body: draft, status: "draft", category: "Notes", tags: "" }, "Draft saved as a blog draft — publish it from the Blog tab when ready.")}>Save as blog draft</button>
        </>
      )}
    </div>
  );
}

function SystemTab({ d, status, runSetup, setupBusy }: { d: Dashboard | null; status: Status; runSetup: () => void; setupBusy: boolean }) {
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="font-semibold">System status</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>Version: {status.version}</li>
          <li>PIN: {status.pinSet ? "✓ configured" : "✗ not configured"}</li>
          <li>Database: {status.dbConfigured ? "✓ connected" : "✗ not connected"}</li>
          <li>Blob uploads: {status.blobConfigured ? "✓ connected" : "✗ not connected"}</li>
          {d?.dbError && <li>DB error: {d.dbError}</li>}
        </ul>
        {status.dbConfigured && (
          <button onClick={runSetup} disabled={setupBusy} className={`${btn} mt-3`} style={{ background: "var(--accent)", color: "#04101a" }}>{setupBusy ? "Setting up…" : "Create tables & seed content"}</button>
        )}
      </div>
      <div className={card}>
        <p className="font-semibold">About this admin</p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Stack: Next.js 14 + Neon Postgres (free tier) + Vercel Blob (free tier), PIN stored only as a SHA-256 hash in Vercel settings.
          Sign-in is rate-limited (5 wrong attempts in 15 minutes) and attempts are logged. The Muse-hosted portfolio remains the working fallback admin.
          Full setup steps: <code>docs/VERCEL_NEON_ADMIN.md</code> in the repo.
        </p>
      </div>
      <div className={card}>
        <p className="font-semibold">Audit log</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(d?.audit ?? []).slice(0, 10).map((a, i) => <li key={i}>{str(a, "action")} — {str(a, "detail")} · {fmtDate(a.created_at)}</li>)}
          {!(d?.audit?.length) && <li style={{ color: "var(--muted)" }}>No activity logged yet.</li>}
        </ul>
      </div>
    </div>
  );
}
