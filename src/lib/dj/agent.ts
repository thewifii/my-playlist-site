// The AI DJ: Claude with server-side tools for Spotify search, tempo/key lookup,
// staging the setlist in the console and creating the playlist on Spotify.
import Anthropic from "@anthropic-ai/sdk";
import { createPlaylist, getTrack, searchTracks, SpotifyError, type DjTrack, type SearchMode } from "./spotify";
import { getTempoAndKey } from "./tempo";

/** Current Sonnet. Override with the ANTHROPIC_MODEL environment variable. */
export const DEFAULT_MODEL = "claude-sonnet-5-5";

export type DjEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; id: string; name: string; status: "running" | "done" | "error"; summary: string }
  | { type: "setlist"; name: string | null; tracks: DjTrack[] }
  | { type: "playlist"; url: string; name: string; tracks: number }
  | { type: "error"; message: string }
  | { type: "done" };

const SYSTEM = `You are the AI DJ for The Wifii, a creator and producer who runs the Culture Lives Here media network. You build Spotify setlists for TikTok Lives, DJ sets, content sessions and editorial playlists.

How you work:
- Use search_spotify_tracks to find real tracks. Never list a track you have not found with the tool, and never invent a Spotify ID.
- Use get_track_tempo_and_key to get the BPM and key for the tracks you are seriously considering. Look up several tracks in one call. If the tool has no data for a track, say so plainly. You may still include the track, but do not present a guessed BPM as fact.
- When you have a setlist worth showing, call stage_setlist with the full ordered list. The tracklist appears in the staging panel next to this chat, so do not retype it in your reply. stage_setlist replaces the whole staged list each time, so always send every track that should remain.
- Sequence like a DJ: keep tempo changes gradual (usually within about 6 BPM between neighbours unless a deliberate reset is wanted), prefer harmonically compatible keys (same or adjacent Camelot codes), and shape the energy to the brief (warm up, peak, cool down).
- Only call create_spotify_playlist when the user clearly asks you to create or push the playlist. Otherwise leave that to the "Push to Spotify" button in the staging panel.

The user's message ends with the setlist currently staged in the panel. They may have removed, reordered or renamed things by hand, so treat it as the source of truth.

Keep replies short and useful: what you built, the tempo range, and one or two choices worth knowing about. Ask a question only when the brief is too vague to act on. Aim for 12 to 20 tracks unless told otherwise.`;

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_spotify_tracks",
    description:
      "Search the Spotify catalog. mode 'tracks' is a normal search (track names, artists, keywords). mode 'artist_top_tracks' returns well-known tracks by one artist (put the artist name in query). mode 'recommendations' finds tracks matching a vibe or genre description. Returns up to 10 to 20 tracks with Spotify IDs. Use page 2, 3, ... for more results.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["tracks", "artist_top_tracks", "recommendations"] },
        query: { type: "string", description: "Search text: a track, an artist, or a vibe such as 'late night r&b slow jams'." },
        genre: { type: "string", description: "Optional Spotify genre filter, e.g. 'hip-hop', 'r&b', 'afrobeats'." },
        year_range: { type: "string", description: "Optional year or range, e.g. '2024' or '2018-2026'." },
        page: { type: "integer", description: "Result page, starting at 1." },
      },
      required: ["mode", "query"],
    },
  },
  {
    name: "get_track_tempo_and_key",
    description: "Look up tempo (BPM), musical key and Camelot code for up to 12 tracks found with search_spotify_tracks. Returns null values for tracks with no data.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { spotify_ids: { type: "array", items: { type: "string" }, description: "Spotify track IDs from search results." } },
      required: ["spotify_ids"],
    },
  },
  {
    name: "stage_setlist",
    description: "Show the ordered setlist in the staging panel. Replaces whatever is staged. Include every track that should be in the list, in play order.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        playlist_name: { type: "string", description: "Suggested playlist name. Omit to keep the current name." },
        spotify_ids: { type: "array", items: { type: "string" }, description: "Spotify track IDs in play order." },
      },
      required: ["spotify_ids"],
    },
  },
  {
    name: "create_spotify_playlist",
    description: "Create a playlist on The Wifii's Spotify account and add the tracks. Only use when the user explicitly asks to create or push the playlist.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        public: { type: "boolean", description: "true for a public playlist, false for private. Defaults to private." },
        track_uris: { type: "array", items: { type: "string" }, description: "spotify:track:... URIs in play order." },
      },
      required: ["name", "track_uris"],
    },
  },
];

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function runDj(opts: {
  apiKey: string;
  model: string;
  history: ChatTurn[];
  setlist: DjTrack[];
  playlistName: string;
  emit: (event: DjEvent) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { emit } = opts;
  const client = new Anthropic({ apiKey: opts.apiKey });
  // Every track seen this turn, so later tools can resolve an ID to full metadata.
  const known = new Map<string, DjTrack>(opts.setlist.map((t) => [t.id, t]));

  const staged = opts.setlist.map((t, i) => ({ position: i + 1, spotify_id: t.id, title: t.title, artist: t.artist, bpm: t.bpm ?? null, key: t.key ?? null, camelot: t.camelot ?? null }));
  const context = `<staged_setlist name=${JSON.stringify(opts.playlistName)} tracks="${staged.length}">\n${JSON.stringify(staged)}\n</staged_setlist>`;

  const messages: Anthropic.Beta.BetaMessageParam[] = opts.history.map((m, i) =>
    i === opts.history.length - 1 && m.role === "user"
      ? { role: "user", content: [{ type: "text", text: m.content }, { type: "text", text: context }] }
      : { role: m.role, content: m.content },
  );

  async function resolve(id: string): Promise<DjTrack | null> {
    const hit = known.get(id);
    if (hit) return hit;
    if (!/^[A-Za-z0-9]{22}$/.test(id)) return null;
    try {
      const t = await getTrack(id);
      known.set(t.id, t);
      return t;
    } catch {
      return null;
    }
  }

  async function runTool(use: Anthropic.Beta.BetaToolUseBlock): Promise<Anthropic.Beta.BetaToolResultBlockParam> {
    const input = (use.input ?? {}) as Record<string, unknown>;
    const fail = (summary: string, content: string): Anthropic.Beta.BetaToolResultBlockParam => {
      emit({ type: "tool", id: use.id, name: use.name, status: "error", summary });
      return { type: "tool_result", tool_use_id: use.id, is_error: true, content };
    };
    const ok = (summary: string, content: unknown): Anthropic.Beta.BetaToolResultBlockParam => {
      emit({ type: "tool", id: use.id, name: use.name, status: "done", summary });
      return { type: "tool_result", tool_use_id: use.id, content: JSON.stringify(content) };
    };

    try {
      if (use.name === "search_spotify_tracks") {
        const mode = input.mode;
        if (typeof input.query !== "string" || !input.query.trim() || (mode !== "tracks" && mode !== "artist_top_tracks" && mode !== "recommendations")) {
          return fail("Invalid search", JSON.stringify({ INVALID_JSON: JSON.stringify(input) }));
        }
        emit({ type: "tool", id: use.id, name: use.name, status: "running", summary: `Searching Spotify: ${input.query}` });
        const tracks = await searchTracks({
          mode: mode as SearchMode,
          query: input.query,
          genre: typeof input.genre === "string" ? input.genre : undefined,
          year_range: typeof input.year_range === "string" ? input.year_range : undefined,
          page: typeof input.page === "number" ? input.page : 1,
        });
        for (const t of tracks) if (!known.has(t.id)) known.set(t.id, t);
        return ok(`Found ${tracks.length} tracks for “${input.query}”`, tracks.map((t) => ({ spotify_id: t.id, title: t.title, artist: t.artist, album: t.album, duration: mmss(t.duration_ms), explicit: t.explicit })));
      }

      if (use.name === "get_track_tempo_and_key") {
        if (!isStringArray(input.spotify_ids) || input.spotify_ids.length === 0) return fail("Invalid tempo lookup", JSON.stringify({ INVALID_JSON: JSON.stringify(input) }));
        const ids = input.spotify_ids.slice(0, 12);
        emit({ type: "tool", id: use.id, name: use.name, status: "running", summary: `Checking tempo and key for ${ids.length} track${ids.length === 1 ? "" : "s"}` });
        const out = [];
        for (const id of ids) {
          const t = await resolve(id);
          if (!t) {
            out.push({ spotify_id: id, error: "Unknown track id. Search for it first." });
            continue;
          }
          if (t.bpm == null) {
            const r = await getTempoAndKey({ title: t.title, artist: t.artist, isrc: t.isrc || undefined });
            Object.assign(t, { bpm: r.bpm, key: r.key, camelot: r.camelot, tempo_source: r.source });
          }
          out.push({ spotify_id: t.id, title: t.title, artist: t.artist, bpm: t.bpm ?? null, key: t.key ?? null, camelot: t.camelot ?? null, source: t.tempo_source ?? null });
        }
        const found = out.filter((o) => "bpm" in o && o.bpm != null).length;
        return ok(`Tempo found for ${found} of ${ids.length} tracks`, out);
      }

      if (use.name === "stage_setlist") {
        if (!isStringArray(input.spotify_ids)) return fail("Invalid setlist", JSON.stringify({ INVALID_JSON: JSON.stringify(input) }));
        const tracks: DjTrack[] = [];
        const missing: string[] = [];
        for (const id of [...new Set(input.spotify_ids)]) {
          const t = await resolve(id);
          if (t) tracks.push(t);
          else missing.push(id);
        }
        const name = typeof input.playlist_name === "string" && input.playlist_name.trim() ? input.playlist_name.trim().slice(0, 100) : null;
        emit({ type: "setlist", name, tracks });
        return ok(`Staged ${tracks.length} tracks`, { staged: tracks.length, unknown_ids: missing });
      }

      if (use.name === "create_spotify_playlist") {
        if (typeof input.name !== "string" || !input.name.trim() || !isStringArray(input.track_uris)) return fail("Invalid playlist request", JSON.stringify({ INVALID_JSON: JSON.stringify(input) }));
        emit({ type: "tool", id: use.id, name: use.name, status: "running", summary: `Creating “${input.name}” on Spotify` });
        const result = await createPlaylist({ name: input.name, description: typeof input.description === "string" ? input.description : undefined, isPublic: input.public === true, uris: input.track_uris });
        emit({ type: "playlist", url: result.url, name: result.name, tracks: result.tracks });
        return ok(`Created “${result.name}” with ${result.tracks} tracks`, result);
      }

      return fail(`Unknown tool ${use.name}`, `Unknown tool: ${use.name}`);
    } catch (err) {
      const message = err instanceof SpotifyError ? err.message : err instanceof Error ? err.message : "Tool failed.";
      return fail(message, message);
    }
  }

  const tuned = opts.model === DEFAULT_MODEL;
  let jsonRetries = 0;

  for (let turn = 0; turn < 16; turn++) {
    const stream = client.beta.messages.stream(
      {
        model: opts.model,
        max_tokens: 16000,
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        messages,
        // Effort tuning and refusal fallback apply to the default model; other models run with their own defaults.
        ...(tuned ? { output_config: { effort: "medium" as const }, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      },
      { signal: opts.signal },
    );
    stream.on("text", (delta) => emit({ type: "text", delta }));

    let message: Anthropic.Beta.BetaMessage;
    try {
      message = await stream.finalMessage();
      jsonRetries = 0;
    } catch (err) {
      // With eager tool-input streaming a malformed tool input rejects here; re-issue that turn a couple of times.
      if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
      continue;
    }

    if (message.stop_reason === "refusal") {
      emit({ type: "error", message: "The AI DJ declined that request. Try rephrasing it." });
      return;
    }
    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) return;
    if (message.stop_reason === "max_tokens") {
      emit({ type: "error", message: "The reply was cut off before the tools could run. Ask for a shorter setlist and try again." });
      return;
    }

    messages.push({ role: "assistant", content: message.content as Anthropic.Beta.BetaContentBlockParam[] });
    // Tool calls from one turn are answered together in a single user message.
    messages.push({ role: "user", content: await Promise.all(toolUses.map(runTool)) });
    emit({ type: "text", delta: "\n\n" });
  }
  emit({ type: "error", message: "That took more steps than expected, so I stopped. The staged setlist shows where I got to." });
}

/** Maps SDK errors to messages the console can show. */
export function describeAnthropicError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.";
  if (err instanceof Anthropic.PermissionDeniedError) return "This Anthropic API key can't use that model. Check ANTHROPIC_MODEL.";
  if (err instanceof Anthropic.NotFoundError) return "That Claude model wasn't found. Check ANTHROPIC_MODEL.";
  if (err instanceof Anthropic.RateLimitError) return "Claude is rate limited right now. Wait a moment and try again.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the Claude API. Check the connection and try again.";
  if (err instanceof Anthropic.APIError) return `Claude API error${err.status ? ` ${err.status}` : ""}: ${err.message}`;
  return err instanceof Error ? err.message : "Something went wrong.";
}
