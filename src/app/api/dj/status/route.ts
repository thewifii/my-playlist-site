import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { DEFAULT_MODEL } from "@/lib/dj/agent";
import { refreshToken, spotifyConfigured } from "@/lib/dj/spotify";

/** Reports which integrations are configured. Returns booleans only, never the secrets themselves. */
export async function GET() {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  return NextResponse.json({
    claude: Boolean(envVar("ANTHROPIC_API_KEY")),
    model: envVar("ANTHROPIC_MODEL") || DEFAULT_MODEL,
    spotifyApp: spotifyConfigured(),
    spotifyAccount: Boolean(await refreshToken()),
    getSongBpm: Boolean(envVar("GETSONGBPM_API_KEY")),
  });
}
