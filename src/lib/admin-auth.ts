// Owner PIN auth for the Vercel admin.
// The PIN itself is never stored anywhere. Only its SHA-256 hex digest is
// kept, in the Vercel env var ADMIN_PIN_HASH (set in the Vercel dashboard,
// never in this repo or in chat). Sessions are HMAC-signed cookies whose
// key is that same hash, so no session table is needed.
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "svc_admin_session";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function getPinHash(): string | null {
  const raw = (process.env.ADMIN_PIN_HASH || "").trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(raw) ? raw : null;
}

export function isPinSet(): boolean {
  return getPinHash() !== null;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function verifyPin(pin: string): boolean {
  const hash = getPinHash();
  if (!hash || !pin) return false;
  return safeEqual(sha256Hex(pin), hash);
}

export function createSessionToken(): string {
  const hash = getPinHash();
  if (!hash) throw new Error("PIN not set");
  const expiry = Date.now() + SESSION_MS;
  const sig = createHmac("sha256", hash).update(String(expiry)).digest("hex");
  return `${expiry}.${sig}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  const hash = getPinHash();
  if (!hash || !token) return false;
  const [expiryStr, sig] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || !sig || expiry < Date.now()) return false;
  const expected = createHmac("sha256", hash).update(String(expiry)).digest("hex");
  return safeEqual(sig, expected);
}

export function sessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MS / 1000}${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === COOKIE_NAME) return decodeURIComponent(v || "");
  }
  return null;
}

export { COOKIE_NAME };
