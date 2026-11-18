import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { authorizeUrl, callbackUrl, spotifyConfigured, STATE_COOKIE } from "@/lib/dj/spotify";

/** Step 1 of the one-time setup: send the admin to Spotify to approve playlist access. */
export async function GET(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  if (!spotifyConfigured()) return NextResponse.json({ error: "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first." }, { status: 503 });

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(callbackUrl(request), state));
  res.cookies.set(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/api/spotify", maxAge: 600 });
  return res;
}
