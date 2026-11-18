// Server-only Spotify Web API helpers for the DJ builder.
// Written against the 2026 Web API: search is capped at 10 results per request,
// playlists are created with POST /me/playlists and filled with POST /playlists/{id}/items,
// and the old artist top-tracks and recommendations endpoints are no longer available,
// so both of those modes are built on search.
import { envVar } from "@/lib/cf";
import { getSetting } from "@/lib/repo";

const API = "https://api.spotify.com/v1";
const ACCOUNTS = "https://accounts.spotify.com";
export const SPOTIFY_SCOPES = "playlist-modify-public playlist-modify-private";
export const REFRESH_TOKEN_SETTING = "spotify_refresh_token";

export interface DjTrack {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration_ms: number;
  isrc: string;
  explicit: boolean;
  url: string;
  bpm?: number | null;
  key?: string | null;
  camelot?: string | null;
  tempo_source?: string | null;
}

export class SpotifyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const cache = globalThis as unknown as { __spotifyTokens?: Record<string, { token: string; exp: number }> };

function credentials(): { id: string; secret: string } {
  const id = envVar("SPOTIFY_CLIENT_ID");
  const secret = envVar("SPOTIFY_CLIENT_SECRET");
  if (!id || !secret) throw new SpotifyError("Spotify isn't configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.", 503);
  return { id, secret };
}

export function spotifyConfigured(): boolean {
  return Boolean(envVar("SPOTIFY_CLIENT_ID") && envVar("SPOTIFY_CLIENT_SECRET"));
}

export async function refreshToken(): Promise<string | null> {
  return envVar("SPOTIFY_REFRESH_TOKEN") || (await getSetting(REFRESH_TOKEN_SETTING));
}

async function tokenRequest(params: Record<string, string>): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  const { id, secret } = credentials();
  const res = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", authorization: `Basic ${btoa(`${id}:${secret}`)}` },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new SpotifyError(`Spotify sign-in failed (${res.status}). Check the client ID, secret and refresh token.`, res.status);
  return res.json();
}

async function cachedToken(kind: "app" | "user", load: () => Promise<{ access_token: string; expires_in: number }>): Promise<string> {
  cache.__spotifyTokens ??= {};
  const hit = cache.__spotifyTokens[kind];
  if (hit && hit.exp > Date.now() + 30_000) return hit.token;
  const fresh = await load();
  cache.__spotifyTokens[kind] = { token: fresh.access_token, exp: Date.now() + fresh.expires_in * 1000 };
  return fresh.access_token;
}

/** Token for my own account (needed to create playlists). Requires the one-time OAuth setup. */
export async function userToken(): Promise<string> {
  const refresh = await refreshToken();
  if (!refresh) throw new SpotifyError("Spotify account isn't connected yet. Open /api/spotify/login once to authorize it.", 428);
  return cachedToken("user", () => tokenRequest({ grant_type: "refresh_token", refresh_token: refresh }));
}

/** Token for catalog reads. Uses my account when connected, otherwise app-only credentials. */
async function readToken(): Promise<string> {
  if (await refreshToken()) return userToken();
  return cachedToken("app", () => tokenRequest({ grant_type: "client_credentials" }));
}

export async function exchangeCode(code: string, redirectUri: string) {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

export function authorizeUrl(redirectUri: string, state: string): string {
  const { id } = credentials();
  const q = new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: redirectUri, scope: SPOTIFY_SCOPES, state, show_dialog: "true" });
  return `${ACCOUNTS}/authorize?${q}`;
}

async function api<T>(path: string, token: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: { authorization: `Bearer ${token}`, ...(init?.body ? { "content-type": "application/json" } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 429) throw new SpotifyError(`Spotify rate limit reached. Try again in ${res.headers.get("retry-after") ?? "a few"} seconds.`, 429);
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new SpotifyError(`Spotify error ${res.status}: ${detail?.error?.message ?? res.statusText}`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

interface RawTrack {
  id: string;
  uri: string;
  name: string;
  explicit?: boolean;
  duration_ms: number;
  artists: { name: string }[];
  album?: { name?: string; images?: { url: string }[] };
  external_ids?: { isrc?: string };
  external_urls?: { spotify?: string };
}

function normalise(t: RawTrack): DjTrack {
  const images = t.album?.images ?? [];
  return {
    id: t.id,
    uri: t.uri,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album?.name ?? "",
    cover: (images[1] ?? images[0])?.url ?? "",
    duration_ms: t.duration_ms,
    isrc: t.external_ids?.isrc ?? "",
    explicit: Boolean(t.explicit),
    url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
  };
}

async function search(q: string, offset = 0): Promise<DjTrack[]> {
  const params = new URLSearchParams({ q, type: "track", limit: "10", offset: String(offset) });
  const data = await api<{ tracks?: { items?: (RawTrack | null)[] } }>(`/search?${params}`, await readToken());
  return (data.tracks?.items ?? []).filter((t): t is RawTrack => Boolean(t?.id)).map(normalise);
}

export type SearchMode = "tracks" | "artist_top_tracks" | "recommendations";

export async function searchTracks(input: { mode: SearchMode; query: string; genre?: string; year_range?: string; page?: number }): Promise<DjTrack[]> {
  const offset = Math.max(0, (input.page ?? 1) - 1) * 10;
  const year = input.year_range ? ` year:${input.year_range}` : "";

  if (input.mode === "artist_top_tracks") return search(`artist:"${input.query}"${year}`, offset);
  if (input.mode === "tracks") return search(`${input.query}${input.genre ? ` genre:"${input.genre}"` : ""}${year}`, offset);

  // "recommendations": blend a free-text search with a genre-filtered one and de-duplicate.
  const queries = [`${input.query}${year}`];
  if (input.genre) queries.push(`genre:"${input.genre}"${year}`, `${input.query} genre:"${input.genre}"${year}`);
  const results = await Promise.all(queries.map((q) => search(q, offset).catch(() => [] as DjTrack[])));
  const seen = new Set<string>();
  const merged: DjTrack[] = [];
  for (let i = 0; i < 10; i++) {
    for (const list of results) {
      const t = list[i];
      if (t && !seen.has(t.id)) {
        seen.add(t.id);
        merged.push(t);
      }
    }
  }
  return merged.slice(0, 20);
}

export async function getTrack(id: string): Promise<DjTrack> {
  return normalise(await api<RawTrack>(`/tracks/${encodeURIComponent(id)}`, await readToken()));
}

export async function createPlaylist(input: { name: string; description?: string; isPublic?: boolean; uris: string[] }): Promise<{ id: string; url: string; name: string; tracks: number }> {
  const uris = [...new Set(input.uris.filter((u) => /^spotify:track:[A-Za-z0-9]{22}$/.test(u)))];
  if (uris.length === 0) throw new SpotifyError("There are no valid tracks to add.", 400);
  const token = await userToken();
  const playlist = await api<{ id: string; external_urls?: { spotify?: string } }>("/me/playlists", token, {
    method: "POST",
    body: { name: input.name.slice(0, 100), description: (input.description ?? "").slice(0, 300), public: Boolean(input.isPublic) },
  });
  for (let i = 0; i < uris.length; i += 100) {
    await api(`/playlists/${playlist.id}/items`, token, { method: "POST", body: { uris: uris.slice(i, i + 100) } });
  }
  return { id: playlist.id, url: playlist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlist.id}`, name: input.name, tracks: uris.length };
}

export const STATE_COOKIE = "spotify_oauth_state";

/** The redirect URI registered in the Spotify Developer Dashboard. Must match exactly. */
export function callbackUrl(request: Request): string {
  return envVar("SPOTIFY_REDIRECT_URI") || new URL("/api/spotify/callback", request.url).toString();
}

/** Forget cached access tokens, e.g. after a new refresh token is stored. */
export function clearTokenCache(): void {
  cache.__spotifyTokens = {};
}
