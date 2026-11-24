import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { isPinSet } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "v13",
    dbConfigured: isDbConfigured(),
    pinSet: isPinSet(),
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    time: new Date().toISOString(),
  });
}
