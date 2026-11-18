import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { DEFAULT_MODEL, describeAnthropicError, runDj, type ChatTurn, type DjEvent } from "@/lib/dj/agent";
import type { DjTrack } from "@/lib/dj/spotify";

/**
 * Streaming AI DJ chat. Responds with newline-delimited JSON events (text deltas, tool status,
 * setlist updates). ANTHROPIC_API_KEY and the Spotify secrets are only ever read here, on the server.
 */
export async function POST(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;

  const apiKey = envVar("ANTHROPIC_API_KEY");
  if (!apiKey) return NextResponse.json({ error: "The AI DJ isn't configured yet. Set the ANTHROPIC_API_KEY secret." }, { status: 503 });

  let body: { messages?: unknown; setlist?: unknown; playlistName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const history: ChatTurn[] = Array.isArray(body.messages)
    ? (body.messages as ChatTurn[])
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
        .slice(-30)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
    : [];
  if (history.length === 0 || history[history.length - 1].role !== "user") return NextResponse.json({ error: "Send a message to the DJ." }, { status: 400 });
  while (history[0].role !== "user") history.shift();

  const setlist = (Array.isArray(body.setlist) ? (body.setlist as DjTrack[]) : []).filter((t) => t && typeof t.id === "string" && typeof t.uri === "string").slice(0, 200);
  const playlistName = typeof body.playlistName === "string" ? body.playlistName.slice(0, 100) : "Untitled setlist";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: DjEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };
      try {
        await runDj({ apiKey, model: envVar("ANTHROPIC_MODEL") || DEFAULT_MODEL, history, setlist, playlistName, emit, signal: request.signal });
      } catch (err) {
        if (!request.signal.aborted) emit({ type: "error", message: describeAnthropicError(err) });
      }
      emit({ type: "done" });
      closed = true;
      try {
        controller.close();
      } catch {}
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store, no-transform", "x-accel-buffering": "no" },
  });
}
