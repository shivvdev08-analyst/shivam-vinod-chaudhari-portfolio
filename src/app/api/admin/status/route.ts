import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { isPinSet } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConfigured = isDbConfigured();
  const pinSet = isPinSet();
  // Never cache: a stale status is what made /admin keep showing the
  // setup page after a PIN was saved and redeployed (v13 bug).
  return NextResponse.json(
    {
      version: "v14",
      dbConfigured,
      pinSet,
      blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      adminReady: dbConfigured && pinSet,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
