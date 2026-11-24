// Neon Postgres (free tier) via the Neon serverless HTTP driver.
// The driver is only constructed when DATABASE_URL is set in Vercel.
// With no DATABASE_URL the site keeps working as a static public site
// and /admin reports "database not configured" instead of crashing.
import { neon } from "@neondatabase/serverless";

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export type SqlFn = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

let cached: SqlFn | null = null;

export function getSql(): SqlFn | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) {
    cached = neon(url) as unknown as SqlFn;
  }
  return cached;
}
