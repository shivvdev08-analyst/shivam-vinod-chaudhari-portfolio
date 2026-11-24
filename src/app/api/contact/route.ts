import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "BAD_JSON" }, { status: 400 }); }
  // Honeypot: bots fill the hidden "company" field; accept silently, store nothing.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true, stored: true });
  }
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "EMAIL_INVALID" }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "MESSAGE_TOO_SHORT" }, { status: 400 });
  const sql = getSql();
  if (!sql) {
    // No database yet: honestly tell the client to fall back to mailto.
    return NextResponse.json({ ok: true, stored: false, mailtoFallback: true });
  }
  try {
    await sql`INSERT INTO contact_messages (name, email, subject, message) VALUES (${name}, ${email}, ${subject}, ${message})`;
    await sql`INSERT INTO analytics_events (kind, path) VALUES ('contact', '/contact')`;
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    return NextResponse.json({ error: "STORE_FAILED", message: e instanceof Error ? e.message : "Could not store the message" }, { status: 500 });
  }
}
