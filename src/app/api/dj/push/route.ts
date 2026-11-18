import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createPlaylist, SpotifyError } from "@/lib/dj/spotify";

/** "Push to Spotify": creates the staged setlist as a playlist on the connected account. */
export async function POST(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;

  let body: { name?: unknown; description?: unknown; public?: unknown; uris?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const uris = Array.isArray(body.uris) ? body.uris.filter((u): u is string => typeof u === "string") : [];
  if (!name) return NextResponse.json({ error: "Give the playlist a name first." }, { status: 400 });
  if (uris.length === 0) return NextResponse.json({ error: "Add at least one track before pushing." }, { status: 400 });

  try {
    const playlist = await createPlaylist({ name, description: typeof body.description === "string" ? body.description : "Built with the Culture Lives Here DJ builder.", isPublic: body.public === true, uris });
    return NextResponse.json({ playlist });
  } catch (err) {
    const status = err instanceof SpotifyError && err.status >= 400 && err.status < 600 ? err.status : 502;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't create the playlist." }, { status });
  }
}
