import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { readSessionToken, verifySessionToken } from "@/lib/admin-auth";
import { projects as staticProjects, achievements, education } from "@/data/portfolio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authed(req: Request) {
  return verifySessionToken(readSessionToken(req.headers.get("cookie")));
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const sql = getSql();
  const base = {
    dbConfigured: Boolean(sql),
    projects: staticProjects.map((p) => ({ slug: p.slug, title: p.title, status: p.status })),
    achievements,
    education,
    messages: [] as Record<string, unknown>[],
    analytics: { totalEvents: 0, byKind: {} as Record<string, number>, recent: [] as Record<string, unknown>[] },
    audit: [] as Record<string, unknown>[],
    memories: [{ title: "Data4Viz — First Position at the Hackathon", category: "academic", featured: true }],
    knowledge: [] as Record<string, unknown>[],
  };
  if (!sql) return NextResponse.json(base);
  try {
    const [msgs, byKind, recent, audit, mem, know, proj] = await Promise.all([
      sql`SELECT id, name, email, subject, message, status, is_spam, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT kind, COUNT(*)::int AS n FROM analytics_events GROUP BY kind`,
      sql`SELECT kind, path, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT action, detail, created_at FROM audit_log ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT id, title, category, featured, published FROM memories ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT id, question, answer, source FROM knowledge_entries ORDER BY id ASC LIMIT 50`,
      sql`SELECT slug, title, status FROM projects ORDER BY title ASC`,
    ]);
    const total = await sql`SELECT COUNT(*)::int AS n FROM analytics_events`;
    return NextResponse.json({
      ...base,
      projects: proj.length ? proj : base.projects,
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
  try {
    if (body.type === "message-status" && typeof body.id === "number" && typeof body.status === "string") {
      await sql`UPDATE contact_messages SET status = ${String(body.status)} WHERE id = ${body.id}`;
      await sql`INSERT INTO audit_log (actor, action, detail) VALUES ('owner', 'message-status', ${`#${body.id} -> ${body.status}`})`;
      return NextResponse.json({ ok: true });
    }
    if (body.type === "memory" && typeof body.title === "string" && typeof body.story === "string") {
      await sql`INSERT INTO memories (title, category, place, story, tags, featured, published) VALUES (${body.title}, ${String(body.category || "academic")}, ${String(body.place || "")}, ${body.story}, ${JSON.stringify((body.tags as string[]) || [])}, ${Boolean(body.featured)}, true)`;
      return NextResponse.json({ ok: true });
    }
    if (body.type === "knowledge" && typeof body.question === "string" && typeof body.answer === "string") {
      await sql`INSERT INTO knowledge_entries (question, answer, source) VALUES (${body.question}, ${body.answer}, ${String(body.source || "Admin")})`;
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "UNKNOWN_TYPE" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "WRITE_FAILED", message: e instanceof Error ? e.message : "Write failed" }, { status: 500 });
  }
}
