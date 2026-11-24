import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { verifyPin, isPinSet, createSessionToken, sessionCookieHeader } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory rate limiting (serverless memory is ephemeral; the durable
// record is the login_attempts table in Neon when the DB is configured).
type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();
const MAX_FAILED = 5;
const WINDOW_MS = 15 * 60 * 1000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "unknown").slice(0, 64);
}

async function logAttempt(ip: string, success: boolean) {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, ${success})`;
  } catch { /* audit logging must never block login */ }
}

export async function POST(req: Request) {
  if (!isPinSet()) {
    return NextResponse.json(
      { error: "PIN_NOT_SET", message: "No admin PIN is configured. Set ADMIN_PIN_HASH in Vercel and redeploy — see docs/VERCEL_NEON_ADMIN.md." },
      { status: 503 }
    );
  }
  const ip = clientIp(req);
  const now = Date.now();
  const cur = attempts.get(ip);
  if (cur && cur.resetAt > now && cur.count >= MAX_FAILED) {
    return NextResponse.json(
      { error: "LOCKED_OUT", message: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }
  if (cur && cur.resetAt <= now) attempts.delete(ip);
  let pin = "";
  try {
    const body = await req.json();
    pin = String(body?.pin || "");
  } catch { /* bad JSON counts as a failed attempt below */ }
  if (!verifyPin(pin)) {
    const next = { count: (cur?.count || 0) + 1, resetAt: cur?.resetAt || now + WINDOW_MS };
    attempts.set(ip, next);
    await logAttempt(ip, false);
    return NextResponse.json({ error: "INVALID_PIN", message: "Incorrect PIN." }, { status: 401 });
  }
  attempts.delete(ip);
  await logAttempt(ip, true);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", sessionCookieHeader(createSessionToken()));
  const sql = getSql();
  if (sql) {
    try { await sql`INSERT INTO audit_log (actor, action, detail) VALUES ('owner', 'login', 'PIN sign-in')`; } catch { /* ignore */ }
  }
  return res;
}
