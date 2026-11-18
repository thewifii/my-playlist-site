"use client";

import { ArrowDown, ArrowUp, Check, CircleAlert, Disc3, ExternalLink, Loader2, LogOut, Music2, Search, SendHorizontal, Square, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DjEvent } from "@/lib/dj/agent";
import type { DjTrack } from "@/lib/dj/spotify";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "TikTok Live Warmup (98–115 BPM)", prompt: "Build a TikTok Live warmup set: 15 feel-good hip-hop and R&B tracks between 98 and 115 BPM, starting mellow and climbing steadily. Keep it clean enough for a live stream." },
  { label: "Peak Energy Hip-Hop/R&B", prompt: "Build a peak-energy hip-hop and R&B set: 16 tracks from the last five years that keep a room moving, mostly 120–150 BPM (or half-time equivalents), sequenced so the energy never drops." },
  { label: "Late Night Cool Down", prompt: "Build a late night cool down: 14 smooth R&B and soul tracks from 70 to 95 BPM that ease the tempo down gradually and stay in compatible keys." },
];

interface ToolNote {
  id: string;
  status: "running" | "done" | "error";
  summary: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  tools?: ToolNote[];
  error?: string;
}

interface Status {
  claude: boolean;
  model: string;
  spotifyApp: boolean;
  spotifyAccount: boolean;
  getSongBpm: boolean;
}

const STORAGE_KEY = "wifii-dj-setlist";
const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

function total(ms: number): string {
  const minutes = Math.round(ms / 60000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("size-2 rounded-full", ok ? "bg-gold" : "bg-destructive")} aria-hidden="true" />
      {label}
      <span className="sr-only">{ok ? ": ready" : ": not set up"}</span>
    </span>
  );
}

export function DjConsole() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [tracks, setTracks] = React.useState<DjTrack[]>([]);
  const [name, setName] = React.useState("Untitled setlist");
  const [isPublic, setIsPublic] = React.useState(false);
  const [status, setStatus] = React.useState<Status | null>(null);
  const [pushing, setPushing] = React.useState(false);
  const [pushed, setPushed] = React.useState<{ url: string; name: string; tracks: number } | null>(null);
  const [pushError, setPushError] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);
  const logRef = React.useRef<HTMLDivElement>(null);
  const restored = React.useRef(false);

  // Restore the staged setlist after a refresh (kept in this browser only).
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as { name?: string; tracks?: DjTrack[] } | null;
      if (saved?.tracks?.length) setTracks(saved.tracks);
      if (saved?.name) setName(saved.name);
    } catch {}
    restored.current = true;
    fetch("/api/dj/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setStatus(s as Status | null))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, tracks }));
    } catch {}
  }, [name, tracks]);

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const patchLast = (fn: (m: ChatMessage) => ChatMessage) => setMessages((list) => list.map((m, i) => (i === list.length - 1 ? fn(m) : m)));

  function handle(event: DjEvent) {
    if (event.type === "text") patchLast((m) => ({ ...m, content: m.content + event.delta }));
    else if (event.type === "tool") {
      patchLast((m) => {
        const tools = [...(m.tools ?? [])];
        const i = tools.findIndex((t) => t.id === event.id);
        const note = { id: event.id, status: event.status, summary: event.summary };
        if (i >= 0) tools[i] = note;
        else tools.push(note);
        return { ...m, tools };
      });
    } else if (event.type === "setlist") {
      setTracks(event.tracks);
      if (event.name) setName(event.name);
      setPushed(null);
    } else if (event.type === "playlist") setPushed({ url: event.url, name: event.name, tracks: event.tracks });
    else if (event.type === "error") patchLast((m) => ({ ...m, error: event.message }));
  }

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const history = [...messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content.trim() })), { role: "user" as const, content: prompt }];
    setMessages((list) => [...list, { role: "user", content: prompt }, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/dj/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, setlist: tracks, playlistName: name }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        patchLast((m) => ({ ...m, error: data.error || `The DJ couldn't respond (${res.status}).` }));
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              handle(JSON.parse(line) as DjEvent);
            } catch {}
          }
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) patchLast((m) => ({ ...m, error: "Connection lost. Your setlist is safe; send the message again." }));
    }
    patchLast((m) => ({ ...m, content: m.content.trim(), tools: m.tools?.map((t) => (t.status === "running" ? { ...t, status: "done" as const } : t)) }));
    setBusy(false);
    abortRef.current = null;
  }

  function move(index: number, by: -1 | 1) {
    setTracks((list) => {
      const next = [...list];
      const target = index + by;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setPushed(null);
  }

  async function push() {
    setPushing(true);
    setPushError("");
    setPushed(null);
    try {
      const res = await fetch("/api/dj/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, public: isPublic, uris: tracks.map((t) => t.uri) }) });
      const data = (await res.json().catch(() => ({}))) as { playlist?: { url: string; name: string; tracks: number }; error?: string };
      if (res.ok && data.playlist) setPushed(data.playlist);
      else setPushError(data.error || "Couldn't create the playlist. Try again.");
    } catch {
      setPushError("Couldn't reach the server. Try again.");
    }
    setPushing(false);
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/dj-builder/login");
  }

  const bpms = tracks.map((t) => t.bpm).filter((b): b is number => typeof b === "number");
  const duration = tracks.reduce((sum, t) => sum + t.duration_ms, 0);

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <Disc3 className={cn("size-5 text-highlight", busy && "animate-spin")} />
        <h1 className="font-heading text-lg font-bold">
          DJ Setlist Builder <span className="kicker ml-2 hidden rounded-sm border border-border px-1.5 py-0.5 text-muted-foreground sm:inline">Private</span>
        </h1>
        <div className="ml-auto flex items-center gap-4">
          {status ? (
            <div className="hidden items-center gap-4 lg:flex">
              <StatusDot ok={status.claude} label="Claude" />
              <StatusDot ok={status.spotifyApp} label="Spotify app" />
              <StatusDot ok={status.spotifyAccount} label="Spotify account" />
              <StatusDot ok label={status.getSongBpm ? "Tempo: AcousticBrainz + GetSongBPM" : "Tempo: AcousticBrainz"} />
            </div>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon-lg" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-1">
        {/* Left: AI DJ chat */}
        <section aria-label="AI DJ chat" className="flex min-h-0 min-w-0 flex-col border-b border-border lg:border-r lg:border-b-0">
          <div ref={logRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-md pt-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-ink">
                  <Music2 className="size-7" />
                </span>
                <h2 className="mt-4 text-2xl font-bold">What are we playing?</h2>
                <p className="mt-2 text-sm text-muted-foreground">Describe the set: the room, the tempo range, the mood, artists to include or avoid. The DJ searches Spotify, checks BPM and key, and stages the tracklist on the right.</p>
                {status && !status.claude ? <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-left text-sm text-destructive">Set the ANTHROPIC_API_KEY secret to turn on the AI DJ.</p> : null}
                {status && !status.spotifyApp ? <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-left text-sm text-destructive">Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET so the DJ can search Spotify.</p> : null}
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%] space-y-2", m.role === "user" && "rounded-lg rounded-br-sm bg-gold px-4 py-2.5 text-ink")}>
                    {m.role === "assistant" ? <p className="kicker text-highlight">AI DJ</p> : null}
                    {m.tools?.length ? (
                      <ul className="space-y-1">
                        {m.tools.map((t) => (
                          <li key={t.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                            {t.status === "running" ? <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" /> : t.status === "error" ? <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-destructive" /> : <Search className="mt-0.5 size-3.5 shrink-0 text-highlight" />}
                            {t.summary}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {m.content ? <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">{m.content}</p> : null}
                    {m.role === "assistant" && !m.content && !m.error && busy && i === messages.length - 1 && !m.tools?.length ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Digging through the crates…
                      </p>
                    ) : null}
                    {m.error ? (
                      <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                        {m.error}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-border p-3 sm:p-4">
            <ul className="no-scrollbar mb-3 flex gap-2 overflow-x-auto" aria-label="Quick prompts">
              {PRESETS.map((p) => (
                <li key={p.label}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send(p.prompt)}
                    className="h-9 rounded-full border border-border px-3 text-xs font-bold whitespace-nowrap transition-colors hover:border-gold hover:bg-gold hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <Label htmlFor="dj-input" className="sr-only">
                Message the AI DJ
              </Label>
              <Textarea
                id="dj-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="e.g. 45 minutes of 2000s R&B for a Sunday live, 85–105 BPM…"
                className="max-h-40 min-h-12 resize-none"
              />
              {busy ? (
                <Button type="button" variant="outline" size="icon-lg" className="size-12 shrink-0" onClick={() => abortRef.current?.abort()} aria-label="Stop">
                  <Square className="size-4" fill="currentColor" />
                </Button>
              ) : (
                <Button type="submit" size="icon-lg" className="size-12 shrink-0" disabled={!input.trim()} aria-label="Send">
                  <SendHorizontal className="size-5" />
                </Button>
              )}
            </form>
          </div>
        </section>

        {/* Right: live setlist staging */}
        <section aria-label="Setlist staging" className="flex min-h-0 min-w-0 flex-col bg-card">
          <div className="shrink-0 space-y-3 border-b border-border p-4 sm:p-6">
            <div>
              <Label htmlFor="playlist-name" className="kicker text-muted-foreground">
                Playlist name
              </Label>
              <Input id="playlist-name" value={name} maxLength={100} onChange={(e) => { setName(e.target.value); setPushed(null); }} className="mt-1 h-12 border-0 border-b border-border bg-transparent px-0 font-heading text-2xl font-bold shadow-none focus-visible:border-gold focus-visible:ring-0 dark:bg-transparent" />
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {tracks.length} track{tracks.length === 1 ? "" : "s"}
              {tracks.length ? ` · ${total(duration)}` : ""}
              {bpms.length ? ` · ${Math.min(...bpms)}–${Math.max(...bpms)} BPM` : ""}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tracks.length === 0 ? (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <p className="font-heading text-xl font-bold">No tracks staged yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pick a quick prompt or describe a set. Tracks land here with BPM, key and duration.</p>
                </div>
              </div>
            ) : (
              <ol>
                <li aria-hidden="true" className="kicker sticky top-0 z-10 grid grid-cols-[2rem_3rem_minmax(0,1fr)_3.5rem_4.5rem_3rem_6.5rem] items-center gap-3 border-b border-border bg-card px-4 py-2 text-muted-foreground max-sm:grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_3rem_5.5rem] sm:px-6">
                  <span>#</span>
                  <span />
                  <span>Title</span>
                  <span className="text-right">BPM</span>
                  <span className="max-sm:hidden">Key</span>
                  <span className="text-right max-sm:hidden">Time</span>
                  <span />
                </li>
                <AnimatePresence initial={false}>
                  {tracks.map((t, i) => (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-[2rem_3rem_minmax(0,1fr)_3.5rem_4.5rem_3rem_6.5rem] items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-muted/50 max-sm:grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_3rem_5.5rem] sm:px-6"
                    >
                      <span className="font-heading font-bold text-muted-foreground tabular-nums">{i + 1}</span>
                      {t.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.cover} alt="" className="size-10 rounded object-cover sm:size-12" />
                      ) : (
                        <span className="grid size-10 place-items-center rounded bg-muted sm:size-12">
                          <Music2 className="size-4 text-muted-foreground" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="block truncate font-bold hover:text-highlight">
                          {t.title}
                        </a>
                        <span className="block truncate text-sm text-muted-foreground">{t.artist}</span>
                      </span>
                      <span className="text-right font-heading font-bold tabular-nums">{t.bpm ?? <span className="font-sans text-xs font-normal text-muted-foreground">n/a</span>}</span>
                      <span className="text-sm max-sm:hidden">
                        {t.key ? (
                          <>
                            {t.camelot ? <span className="mr-1 rounded-sm bg-gold px-1 py-0.5 text-[0.7rem] font-bold text-ink">{t.camelot}</span> : null}
                            <span className="text-muted-foreground">{t.key.replace(" major", "").replace(" minor", "m")}</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">n/a</span>
                        )}
                      </span>
                      <span className="text-right text-sm text-muted-foreground tabular-nums max-sm:hidden">{mmss(t.duration_ms)}</span>
                      <span className="flex justify-end">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${t.title} up`} className="grid size-8 place-items-center rounded hover:bg-muted disabled:opacity-25 max-sm:size-7">
                          <ArrowUp className="size-4" />
                        </button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === tracks.length - 1} aria-label={`Move ${t.title} down`} className="grid size-8 place-items-center rounded hover:bg-muted disabled:opacity-25 max-sm:size-7">
                          <ArrowDown className="size-4" />
                        </button>
                        <button type="button" onClick={() => { setTracks((list) => list.filter((x) => x.id !== t.id)); setPushed(null); }} aria-label={`Remove ${t.title}`} className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive max-sm:size-7">
                          <X className="size-4" />
                        </button>
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            )}
          </div>

          <div className="shrink-0 space-y-3 border-t border-border p-4 sm:p-6">
            {pushed ? (
              <p className="flex flex-wrap items-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-3 py-2.5 text-sm" role="status">
                <Check className="size-4 text-highlight" />
                <span>
                  <span className="font-bold">{pushed.name}</span> is on Spotify with {pushed.tracks} tracks.
                </span>
                <a href={pushed.url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 font-bold underline underline-offset-4">
                  Open playlist <ExternalLink className="size-3.5" />
                </a>
              </p>
            ) : null}
            {pushError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {pushError}
              </p>
            ) : null}
            {status && status.spotifyApp && !status.spotifyAccount ? (
              <p className="rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground">
                One-time setup: connect your Spotify account so playlists can be created.{" "}
                <a href="/api/spotify/login" className="font-bold text-foreground underline underline-offset-4">
                  Connect Spotify
                </a>
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="playlist-public" checked={isPublic} onCheckedChange={(c) => setIsPublic(c === true)} />
                  <Label htmlFor="playlist-public" className="text-sm">
                    Public playlist
                  </Label>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" disabled={tracks.length === 0 || busy} onClick={() => { setTracks([]); setPushed(null); }}>
                  <Trash2 className="size-3.5" /> Clear
                </Button>
              </div>
              <Button size="lg" className="h-12 gap-2 px-6 text-base font-bold" onClick={push} disabled={tracks.length === 0 || pushing || busy || !name.trim()}>
                {pushing ? <Loader2 className="size-4 animate-spin" /> : null} Push to Spotify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <a href="https://getsongbpm.com" target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                Tempo data powered by GetSongBPM
              </a>{" "}
              and AcousticBrainz. BPM and key are a guide: trust your ears.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
