// Signed session cookies using the Web Crypto API only (no Node `crypto`),
// so this module runs unchanged in middleware and on Cloudflare Workers.

export interface Session {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "contributor";
  /** Expiry, seconds since epoch */
  exp: number;
}

export const SESSION_COOKIE = "wifii_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(value: string): Uint8Array {
  const s = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** The signing secret. Sessions cannot be issued or verified without one. */
function secret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

async function hmac(message: string, keyText: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(keyText), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Compares two secrets without leaking where they differ. */
export async function secretsMatch(a: string, b: string): Promise<boolean> {
  const key = "wifii-compare";
  return constantTimeEqual(await hmac(a, key), await hmac(b, key));
}

export async function signSession(session: Omit<Session, "exp">): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const payload: Session = { ...session, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${b64url(await hmac(body, key))}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  const key = secret();
  if (!key || !token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    if (!constantTimeEqual(fromB64url(signature), await hmac(body, key))) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (!session.exp || session.exp < Date.now() / 1000) return null;
    if (session.role !== "admin" && session.role !== "contributor") return null;
    return session;
  } catch {
    return null;
  }
}

// ───────── password hashing (PBKDF2-SHA256 via Web Crypto) ─────────

const ITERATIONS = 100_000; // the maximum Cloudflare Workers allows for PBKDF2

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(await pbkdf2(password, salt, ITERATIONS))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  try {
    return constantTimeEqual(await pbkdf2(password, fromB64url(salt), Number(iterations)), fromB64url(hash));
  } catch {
    return false;
  }
}
