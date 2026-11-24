import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { isPinSet } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConfigured = isDbConfigured();
  const pinSet = isPinSet();
  return NextResponse.json({
    version: "v13",
    dbConfigured,
    pinSet,
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    adminReady: dbConfigured && pinSet,
  });
}
