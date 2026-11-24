import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { readSessionToken, verifySessionToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Resume / photo upload to Vercel Blob (REST API, server-side only).
// Requires BLOB_READ_WRITE_TOKEN (set automatically when a Blob store is
// created in Vercel Dashboard > Storage). Without it, uploads honestly
// report "not configured" instead of pretending to work.
export async function POST(req: Request) {
  if (!verifySessionToken(readSessionToken(req.headers.get("cookie")))) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BLOB_NOT_CONFIGURED", message: "No Blob store is connected. Create one in Vercel Dashboard > Storage > Create Store > Blob (free)." },
      { status: 503 }
    );
  }
  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "BAD_FORM" }, { status: 400 }); }
  const file = form.get("file");
  const kind = String(form.get("kind") || "file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "FILE_TOO_LARGE", message: "Max 10 MB." }, { status: 400 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload";
  const pathname = `uploads/${Date.now()}-${safeName}`;
  const res = await fetch(`https://blob.vercel.sh/${pathname}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-content-type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    return NextResponse.json({ error: "BLOB_UPLOAD_FAILED", message: `Blob returned ${res.status}` }, { status: 502 });
  }
  const data = (await res.json()) as { url?: string };
  const sql = getSql();
  if (sql && kind === "resume" && data.url) {
    try {
      await sql`INSERT INTO resumes (label, blob_url, is_default, is_public) VALUES (${safeName}, ${data.url}, true, true)`;
    } catch { /* record-keeping must not fail the upload */ }
  }
  return NextResponse.json({ ok: true, url: data.url });
}
