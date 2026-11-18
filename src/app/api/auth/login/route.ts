import { NextResponse } from "next/server";
import { ADMIN_EMAIL_DEFAULT } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { getUserByEmail } from "@/lib/repo";
import { SESSION_COOKIE, SESSION_MAX_AGE, secretsMatch, signSession, verifyPassword, type Session } from "@/lib/session";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Signs in the admin (ADMIN_PASSWORD secret) or an invited contributor (D1 `users` table).
 * `scope: "dj"` is the password-only gate used by /dj-builder and only accepts the admin password.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string; scope?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const djScope = body.scope === "dj";

  const adminPassword = envVar("ADMIN_PASSWORD");
  if (!adminPassword && !envVar("SESSION_SECRET")) {
    return NextResponse.json({ error: "Sign-in is not configured yet. Set the ADMIN_PASSWORD secret, then try again." }, { status: 503 });
  }
  if (!password || password.length > 500) return NextResponse.json({ error: "Enter your password." }, { status: 400 });

  const adminEmail = (envVar("ADMIN_EMAIL") || ADMIN_EMAIL_DEFAULT).toLowerCase();
  let session: Omit<Session, "exp"> | null = null;

  if (adminPassword && (djScope || email === adminEmail) && (await secretsMatch(password, adminPassword))) {
    session = { uid: "admin", name: "The Wifii", email: adminEmail, role: "admin" };
  } else if (!djScope && email) {
    const user = await getUserByEmail(email);
    if (user && (await verifyPassword(password, user.password_hash))) {
      session = { uid: user.id, name: user.name, email: user.email, role: user.role === "admin" ? "admin" : "contributor" };
    }
  }

  if (!session) {
    await wait(600); // slow down guessing
    return NextResponse.json({ error: djScope ? "Wrong password." : "Wrong email or password." }, { status: 401 });
  }

  const token = await signSession(session);
  if (!token) return NextResponse.json({ error: "Sign-in is not configured yet." }, { status: 503 });

  const res = NextResponse.json({ ok: true, role: session.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
