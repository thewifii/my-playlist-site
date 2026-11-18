import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

/** The signed-in user for the current request, or null. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for route handlers. Middleware already protects these paths; this is a second check
 * so an endpoint is never open just because a matcher was missed.
 */
export async function requireSession(role?: "admin"): Promise<{ session: Session } | { response: NextResponse }> {
  const session = await getSession();
  if (!session) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (role === "admin" && session.role !== "admin") {
    return { response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { session };
}

export const ADMIN_EMAIL_DEFAULT = "admin@thewifii.com";
