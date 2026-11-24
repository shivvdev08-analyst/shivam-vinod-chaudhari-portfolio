import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { readSessionToken, verifySessionToken } from "@/lib/admin-auth";
import { projects } from "@/data/portfolio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Canonical schema lives in db/schema.sql; these statements mirror it so
// setup can run from the server without reading files at runtime.
const STATEMENTS: string[] = [
  "CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE TABLE IF NOT EXISTS projects (slug TEXT PRIMARY KEY, title TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '', team TEXT NOT NULL DEFAULT '', stack JSONB NOT NULL DEFAULT '[]'::jsonb, github_url TEXT NOT NULL DEFAULT '', body JSONB NOT NULL DEFAULT '{}'::jsonb, published BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE TABLE IF NOT EXISTS blog_posts (slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', category TEXT NOT NULL DEFAULT '', tags JSONB NOT NULL DEFAULT '[]'::jsonb, published_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE TABLE IF NOT EXISTS memories (id SERIAL PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'academic', place TEXT NOT NULL DEFAULT '', story TEXT NOT NULL DEFAULT '', tags JSONB NOT NULL DEFAULT '[]'::jsonb, featured BOOLEAN NOT NULL DEFAULT false, published BOOLEAN NOT NULL DEFAULT true, media_url TEXT NOT NULL DEFAULT '', media_kind TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE TABLE IF NOT EXISTS contact_messages (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', is_spam BOOLEAN NOT NULL DEFAULT false, notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC)",
  "CREATE TABLE IF NOT EXISTS analytics_events (id SERIAL PRIMARY KEY, kind TEXT NOT NULL, path TEXT NOT NULL DEFAULT '', referrer TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE INDEX IF NOT EXISTS analytics_events_kind_created_idx ON analytics_events (kind, created_at DESC)",
  "CREATE TABLE IF NOT EXISTS audit_log (id SERIAL PRIMARY KEY, actor TEXT NOT NULL DEFAULT 'owner', action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC)",
  "CREATE TABLE IF NOT EXISTS login_attempts (id SERIAL PRIMARY KEY, ip TEXT NOT NULL DEFAULT '', success BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE INDEX IF NOT EXISTS login_attempts_created_idx ON login_attempts (created_at DESC)",
  "CREATE TABLE IF NOT EXISTS knowledge_entries (id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, source TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  "CREATE TABLE IF NOT EXISTS resumes (id SERIAL PRIMARY KEY, label TEXT NOT NULL, blob_url TEXT NOT NULL, is_default BOOLEAN NOT NULL DEFAULT false, is_public BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now())",
];

const KNOWLEDGE: Array<[string, string, string]> = [
  ["Has he won any hackathons?", "Yes — First Position at a Modern College of Engineering hackathon with Team Alpha, for Data4Viz, an AI-powered exploratory data analysis automation app.", "Achievements"],
  ["What is he studying?", "MCA (2025–2027) at Dr. D. Y. Patil Dnyan Prasad Global University, Tathawade, Pune — two-semester CGPA 9.09. BCA from Moolji Jetha Autonomous College, Jalgaon — CGPA 8.33.", "Education"],
  ["What is VERITAS?", "His MCA capstone with Divya Padukone — a multimodal document intelligence platform: EasyOCR, MiniLM 384-dim embeddings, PostgreSQL/pgvector semantic search, FastAPI.", "VERITAS case study"],
  ["What is ASTRA?", "His personal AI companion, in development — voice-first, local AI via Ollama, application launching and long-term memory.", "ASTRA case study"],
  ["Is he open to work?", "Open to AI engineering internships and entry-level roles.", "Profile"],
];

export async function POST(req: Request) {
  if (!verifySessionToken(readSessionToken(req.headers.get("cookie")))) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DB_NOT_CONFIGURED", message: "DATABASE_URL is not set. Create the Neon database in Vercel Dashboard > Storage first." }, { status: 503 });
  }
  try {
    for (const stmt of STATEMENTS) {
      await sql([stmt] as unknown as TemplateStringsArray);
    }
    for (const p of projects) {
      await sql`INSERT INTO projects (slug, title, tagline, category, status, team, stack, github_url, body, published) VALUES (${p.slug}, ${p.title}, ${p.tagline}, ${p.category}, ${p.status}, ${p.team}, ${JSON.stringify(p.stack)}, ${p.githubUrl}, ${JSON.stringify(p)}, true) ON CONFLICT (slug) DO NOTHING`;
    }
    await sql`INSERT INTO memories (title, category, place, story, tags, featured, published) VALUES ('Data4Viz — First Position at the Hackathon', 'academic', '', 'Data4Viz — the AI-powered exploratory data analysis automation app built with Team Alpha — won First Position at a Modern College of Engineering hackathon.', ${JSON.stringify(["Hackathon", "Data4Viz", "Team Alpha", "Winner"])}, true, true) ON CONFLICT DO NOTHING`;
    for (const [q, a, s] of KNOWLEDGE) {
      await sql`INSERT INTO knowledge_entries (question, answer, source) SELECT ${q}, ${a}, ${s} WHERE NOT EXISTS (SELECT 1 FROM knowledge_entries WHERE question = ${q})`;
    }
    await sql`INSERT INTO audit_log (actor, action, detail) VALUES ('owner', 'setup', 'Tables created and verified content seeded')`;
    return NextResponse.json({ ok: true, seededProjects: projects.length });
  } catch (e) {
    return NextResponse.json({ error: "SETUP_FAILED", message: e instanceof Error ? e.message : "Setup failed" }, { status: 500 });
  }
}
