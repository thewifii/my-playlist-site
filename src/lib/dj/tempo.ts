// Tempo (BPM) and musical key lookup.
// Primary source: MusicBrainz (find the recording) + AcousticBrainz (audio analysis).
// Optional fallback: GetSongBPM, used only when GETSONGBPM_API_KEY is set.
import { envVar } from "@/lib/cf";

export interface TempoResult {
  bpm: number | null;
  key: string | null;
  camelot: string | null;
  source: "acousticbrainz" | "getsongbpm" | null;
}

const USER_AGENT = "TheWifiiDJBuilder/1.0 (+https://thewifii.com)";

const CAMELOT: Record<string, string> = {
  "B major": "1B", "F# major": "2B", "C# major": "3B", "G# major": "4B", "D# major": "5B", "A# major": "6B",
  "F major": "7B", "C major": "8B", "G major": "9B", "D major": "10B", "A major": "11B", "E major": "12B",
  "G# minor": "1A", "D# minor": "2A", "A# minor": "3A", "F minor": "4A", "C minor": "5A", "G minor": "6A",
  "D minor": "7A", "A minor": "8A", "E minor": "9A", "B minor": "10A", "F# minor": "11A", "C# minor": "12A",
};
const FLATS: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", "D♭": "C#", "E♭": "D#", "G♭": "F#", "A♭": "G#", "B♭": "A#" };

/** "Bbm", "A♭ major", "F# minor" -> { key: "A# minor", camelot: "3A" } */
export function describeKey(raw: string | null | undefined, scale?: string | null): { key: string | null; camelot: string | null } {
  if (!raw) return { key: null, camelot: null };
  const m = raw.trim().replace("♯", "#").match(/^([A-G](?:#|b|♭)?)\s*(m(?:in(?:or)?)?|maj(?:or)?)?$/i);
  if (!m) return { key: raw, camelot: null };
  const letter = m[1].charAt(0).toUpperCase() + m[1].slice(1);
  const note = FLATS[letter] ?? letter;
  const quality = (scale ?? m[2] ?? "major").toLowerCase();
  const mode = quality === "m" || quality.startsWith("min") ? "minor" : "major";
  const key = `${note} ${mode}`;
  return { key, camelot: CAMELOT[key] ?? null };
}

// MusicBrainz asks for at most one request per second. Calls are queued one after another.
let queue: Promise<unknown> = Promise.resolve();
function musicbrainz<T>(path: string): Promise<T | null> {
  const run = async (): Promise<T | null> => {
    try {
      const res = await fetch(`https://musicbrainz.org/ws/2/${path}`, { headers: { "user-agent": USER_AGENT, accept: "application/json" } });
      await new Promise((r) => setTimeout(r, 1100));
      return res.ok ? ((await res.json()) as T) : null;
    } catch {
      return null;
    }
  };
  const next = queue.then(run, run);
  queue = next;
  return next;
}

async function recordingIds(title: string, artist: string, isrc?: string): Promise<string[]> {
  const ids: string[] = [];
  if (isrc) {
    const byIsrc = await musicbrainz<{ recordings?: { id: string }[] }>(`isrc/${encodeURIComponent(isrc)}?fmt=json`);
    ids.push(...(byIsrc?.recordings ?? []).map((r) => r.id));
  }
  if (ids.length === 0) {
    const clean = (s: string) => s.replace(/["\\]/g, " ").replace(/\s*[(\[].*?[)\]]\s*/g, " ").trim();
    const query = `recording:"${clean(title)}" AND artist:"${clean(artist.split(",")[0])}"`;
    const found = await musicbrainz<{ recordings?: { id: string; score?: number }[] }>(`recording?query=${encodeURIComponent(query)}&limit=5&fmt=json`);
    ids.push(...(found?.recordings ?? []).filter((r) => (r.score ?? 0) >= 80).map((r) => r.id));
  }
  return ids.slice(0, 4);
}

async function fromAcousticBrainz(title: string, artist: string, isrc?: string): Promise<TempoResult | null> {
  for (const id of await recordingIds(title, artist, isrc)) {
    try {
      const res = await fetch(`https://acousticbrainz.org/api/v1/${id}/low-level`, { headers: { "user-agent": USER_AGENT } });
      if (!res.ok) continue;
      const data = (await res.json()) as { rhythm?: { bpm?: number }; tonal?: { key_key?: string; key_scale?: string } };
      const bpm = data.rhythm?.bpm;
      if (!bpm) continue;
      return { bpm: Math.round(bpm), ...describeKey(data.tonal?.key_key, data.tonal?.key_scale), source: "acousticbrainz" };
    } catch {}
  }
  return null;
}

async function fromGetSongBpm(title: string, artist: string, apiKey: string): Promise<TempoResult | null> {
  const base = envVar("GETSONGBPM_API_BASE") || "https://api.getsong.co";
  const lookup = `song:${title.replace(/\s*[(\[].*?[)\]]\s*/g, " ").trim()} artist:${artist.split(",")[0].trim()}`;
  try {
    const res = await fetch(`${base}/search/?${new URLSearchParams({ api_key: apiKey, type: "both", lookup })}`, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { search?: { tempo?: string | number; key_of?: string }[] | { error?: string } };
    const hit = Array.isArray(data.search) ? data.search.find((s) => Number(s.tempo) > 0) : null;
    if (!hit) return null;
    return { bpm: Math.round(Number(hit.tempo)), ...describeKey(hit.key_of), source: "getsongbpm" };
  } catch {
    return null;
  }
}

export async function getTempoAndKey(input: { title: string; artist: string; isrc?: string }): Promise<TempoResult> {
  const primary = await fromAcousticBrainz(input.title, input.artist, input.isrc);
  if (primary) return primary;
  const key = envVar("GETSONGBPM_API_KEY");
  if (key) {
    const fallback = await fromGetSongBpm(input.title, input.artist, key);
    if (fallback) return fallback;
  }
  return { bpm: null, key: null, camelot: null, source: null };
}
