import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { readSessionToken, verifySessionToken } from "@/lib/admin-auth";
import { projects as staticProjects, achievements, education, skillGroups, profile } from "@/data/portfolio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authed(req: Request) {
  return verifySessionToken(readSessionToken(req.headers.get("cookie")));
}

const AGENTFORGE_STATIC = [
  { slug: "safegen", title: "SafeGen AI", tagline: "Self-reflective LLM evaluation", status: "in-progress", stack: ["Python", "FastAPI", "Groq"], description: "Generate → Judge → Repair: evaluates LLM outputs and repairs them." },
  { slug: "astra", title: "ASTRA", tagline: "The Future, Within Reach.", status: "in-development", stack: ["Python", "Ollama", "Local LLMs"], description: "Personal AI companion — voice-first, local AI, long-term memory." },
  { slug: "nova", title: "NOVA Agent", tagline: "Agent reasoning", status: "planning", stack: ["Python", "LangGraph", "CrewAI"], description: "Agent reasoning layer — planned." },
  { slug: "splitsage", title: "SplitSage AI", tagline: "Split expenses, smartly", status: "completed", stack: ["Next.js", "Express", "PostgreSQL", "Prisma", "OCR", "Groq"], description: "MVP completed." },
];

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const sql = getSql();
  const base = {
    dbConfigured: Boolean(sql),
    projects: staticProjects.map((p) => ({ slug: p.slug, title: p.title, tagline: p.tagline, category: p.category, status: p.status, stack: p.stack, github_url: p.githubUrl, published: true })),
    achievements,
    education,
    skills: skillGroups.flatMap((g) => g.skills.map((name, i) => ({ id: 0, name, category: g.name, level: "", sort_order: i }))),
    profile: { name: profile.name, role: profile.role, tagline: profile.tagline, intro: profile.intro, location: profile.location, availability: profile.availability, photo_url: "" },
    agentforge: AGENTFORGE_STATIC,
    blogPosts: [] as Record<string, unknown>[],
    resumes: [] as Record<string, unknown>[],
    settings: {} as Record<string, string>,
    messages: [] as Record<string, unknown>[],
    analytics: { totalEvents: 0, byKind: {} as Record<string, number>, recent: [] as Record<string, unknown>[] },
    audit: [] as Record<string, unknown>[],
    memories: [{ title: "Data4Viz — First Position at the Hackathon", category: "academic", featured: true }],
    knowledge: [] as Record<string, unknown>[],
  };
  if (!sql) return NextResponse.json(base);
  try {
    const [msgs, byKind, recent, audit, mem, know, proj, skills, posts, resumes, settings, nodes] = await Promise.all([
      sql`SELECT id, name, email, subject, message, status, is_spam, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT kind, COUNT(*)::int AS n FROM analytics_events GROUP BY kind`,
      sql`SELECT kind, path, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT action, detail, created_at FROM audit_log ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT id, title, category, featured, published FROM memories ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT id, question, answer, source FROM knowledge_entries ORDER BY id ASC LIMIT 50`,
      sql`SELECT slug, title, tagline, category, status, stack, github_url, published FROM projects ORDER BY title ASC`,
      sql`SELECT id, name, category, level, sort_order FROM skills ORDER BY category ASC, sort_order ASC`,
      sql`SELECT slug, title, body, status, category, tags, published_at FROM blog_posts ORDER BY updated_at DESC LIMIT 50`,
      sql`SELECT id, label, blob_url, is_default, is_public, created_at FROM resumes ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT key, value FROM admin_settings`,
      sql`SELECT slug, title, tagline, status, stack, description, sort_order FROM agentforge_nodes ORDER BY sort_order ASC`,
    ]);
    const total = await sql`SELECT COUNT(*)::int AS n FROM analytics_events`;
    const settingsObj: Record<string, string> = {};
    for (const r of settings) settingsObj[String(r.key)] = String(r.value);
    return NextResponse.json({
      ...base,
      projects: proj.length ? proj : base.projects,
      skills: skills.length ? skills : base.skills,
      agentforge: nodes.length ? nodes : base.agentforge,
      blogPosts: posts,
      resumes,
      settings: settingsObj,
      profile: {
        name: settingsObj["profile.name"] || profile.name,
        role: settingsObj["profile.role"] || profile.role,
        tagline: settingsObj["profile.tagline"] || profile.tagline,
        intro: settingsObj["profile.intro"] || profile.intro,
        location: settingsObj["profile.location"] || profile.location,
        availability: settingsObj["profile.availability"] || profile.availability,
        photo_url: settingsObj["profile.photo_url"] || "",
      },
      messages: msgs,
      analytics: { totalEvents: (total[0]?.n as number) || 0, byKind: Object.fromEntries(byKind.map((r) => [r.kind, r.n])), recent },
      audit,
      memories: mem.length ? mem : base.memories,
      knowledge: know,
    });
  } catch (e) {
    return NextResponse.json({ ...base, dbError: e instanceof Error ? e.message : "DB read failed" });
  }
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB_NOT_CONFIGURED" }, { status: 503 });
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "BAD_JSON" }, { status: 400 }); }
  const audit = async (action: string, detail: string) => {
    try { await sql`INSERT INTO audit_log (actor, action, detail) VALUES ('owner', ${action}, ${detail})`; } catch { /* audit must not fail the write */ }
  };
  try {
    const type = String(body.type || "");
    if (type === "message-status" && typeof body.id === "number" && typeof body.status === "string") {
      await sql`UPDATE contact_messages SET status = ${String(body.status)} WHERE id = ${body.id}`;
      await audit("message-status", `#${body.id} -> ${body.status}`);
      return NextResponse.json({ ok: true });
    }
    if (type === "memory" && typeof body.title === "string" && typeof body.story === "string") {
      await sql`INSERT INTO memories (title, category, place, story, tags, featured, published) VALUES (${body.title}, ${String(body.category || "academic")}, ${String(body.place || "")}, ${body.story}, ${JSON.stringify((body.tags as string[]) || [])}, ${Boolean(body.featured)}, true)`;
      await audit("memory-add", String(body.title));
      return NextResponse.json({ ok: true });
    }
    if (type === "memory-delete" && typeof body.id === "number") {
      await sql`DELETE FROM memories WHERE id = ${body.id}`;
      await audit("memory-delete", `#${body.id}`);
      return NextResponse.json({ ok: true });
    }
    if (type === "knowledge" && typeof body.question === "string" && typeof body.answer === "string") {
      await sql`INSERT INTO knowledge_entries (question, answer, source) VALUES (${body.question}, ${body.answer}, ${String(body.source || "Admin")})`;
      await audit("knowledge-add", String(body.question));
      return NextResponse.json({ ok: true });
    }
    if (type === "knowledge-delete" && typeof body.id === "number") {
      await sql`DELETE FROM knowledge_entries WHERE id = ${body.id}`;
      await audit("knowledge-delete", `#${body.id}`);
      return NextResponse.json({ ok: true });
    }
    if (type === "project" && typeof body.title === "string" && body.title.trim()) {
      const slug = typeof body.slug === "string" && body.slug ? slugify(String(body.slug)) : slugify(String(body.title));
      const stack = Array.isArray(body.stack) ? body.stack : String(body.stack || "").split(",").map((s) => s.trim()).filter(Boolean);
      await sql`INSERT INTO projects (slug, title, tagline, category, status, team, stack, github_url, body, published) VALUES (${slug}, ${body.title}, ${String(body.tagline || "")}, ${String(body.category || "")}, ${String(body.status || "in-development")}, ${String(body.team || "Solo project")}, ${JSON.stringify(stack)}, ${String(body.github_url || "")}, ${JSON.stringify({ description: String(body.description || "") })}, ${body.published !== false}) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, tagline = EXCLUDED.tagline, category = EXCLUDED.category, status = EXCLUDED.status, team = EXCLUDED.team, stack = EXCLUDED.stack, github_url = EXCLUDED.github_url, body = EXCLUDED.body, published = EXCLUDED.published, updated_at = now()`;
      await audit("project-save", `${slug} — ${body.title}`);
      return NextResponse.json({ ok: true, slug });
    }
    if (type === "project-delete" && typeof body.slug === "string") {
      await sql`DELETE FROM projects WHERE slug = ${body.slug}`;
      await audit("project-delete", String(body.slug));
      return NextResponse.json({ ok: true });
    }
    if (type === "skill" && typeof body.name === "string" && body.name.trim()) {
      if (typeof body.id === "number") {
        await sql`UPDATE skills SET name = ${body.name}, category = ${String(body.category || "General")}, level = ${String(body.level || "")} WHERE id = ${body.id}`;
      } else {
        await sql`INSERT INTO skills (name, category, level, sort_order) VALUES (${body.name}, ${String(body.category || "General")}, ${String(body.level || "")}, 0)`;
      }
      await audit("skill-save", String(body.name));
      return NextResponse.json({ ok: true });
    }
    if (type === "skill-delete" && typeof body.id === "number") {
      await sql`DELETE FROM skills WHERE id = ${body.id}`;
      await audit("skill-delete", `#${body.id}`);
      return NextResponse.json({ ok: true });
    }
    if (type === "blog" && typeof body.title === "string" && body.title.trim()) {
      const slug = typeof body.slug === "string" && body.slug ? slugify(String(body.slug)) : slugify(String(body.title));
      const tags = Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
      await sql`INSERT INTO blog_posts (slug, title, body, status, category, tags, published_at) VALUES (${slug}, ${body.title}, ${String(body.body || "")}, ${String(body.status || "draft")}, ${String(body.category || "Notes")}, ${JSON.stringify(tags)}, ${body.status === "published" ? new Date().toISOString() : null}) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, status = EXCLUDED.status, category = EXCLUDED.category, tags = EXCLUDED.tags, updated_at = now()`;
      await audit("blog-save", `${slug} — ${body.title}`);
      return NextResponse.json({ ok: true, slug });
    }
    if (type === "blog-delete" && typeof body.slug === "string") {
      await sql`DELETE FROM blog_posts WHERE slug = ${body.slug}`;
      await audit("blog-delete", String(body.slug));
      return NextResponse.json({ ok: true });
    }
    if (type === "agentforge" && typeof body.title === "string" && body.title.trim()) {
      const slug = typeof body.slug === "string" && body.slug ? slugify(String(body.slug)) : slugify(String(body.title));
      const stack = Array.isArray(body.stack) ? body.stack : String(body.stack || "").split(",").map((s) => s.trim()).filter(Boolean);
      await sql`INSERT INTO agentforge_nodes (slug, title, tagline, status, stack, description, sort_order) VALUES (${slug}, ${body.title}, ${String(body.tagline || "")}, ${String(body.status || "planning")}, ${JSON.stringify(stack)}, ${String(body.description || "")}, ${Number(body.sort_order || 0)}) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, tagline = EXCLUDED.tagline, status = EXCLUDED.status, stack = EXCLUDED.stack, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, updated_at = now()`;
      await audit("agentforge-save", `${slug} — ${body.title}`);
      return NextResponse.json({ ok: true, slug });
    }
    if (type === "agentforge-delete" && typeof body.slug === "string") {
      await sql`DELETE FROM agentforge_nodes WHERE slug = ${body.slug}`;
      await audit("agentforge-delete", String(body.slug));
      return NextResponse.json({ ok: true });
    }
    if (type === "settings" && typeof body.settings === "object" && body.settings) {
      for (const [k, v] of Object.entries(body.settings as Record<string, unknown>)) {
        if (typeof v !== "string") continue;
        await sql`INSERT INTO admin_settings (key, value) VALUES (${k}, ${v}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      }
      await audit("settings-save", Object.keys(body.settings as Record<string, unknown>).join(", "));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "UNKNOWN_TYPE" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "WRITE_FAILED", message: e instanceof Error ? e.message : "Write failed" }, { status: 500 });
  }
}
