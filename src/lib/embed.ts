export type EmbedKind = "youtube" | "vimeo" | "tiktok" | "instagram" | "spotify" | "apple" | "soundcloud" | "audio" | "video" | "link";

export interface ResolvedEmbed {
  kind: EmbedKind;
  src: string;
  /** Fixed pixel height for audio-style players; undefined means use the aspect ratio */
  height?: number;
  aspect?: number;
  label: string;
}

/** Turns a normal share URL into the URL its player iframe needs. */
export function resolveEmbed(raw: string): ResolvedEmbed {
  const url = raw.trim();
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { kind: "link", src: url, label: "Link" };
  }
  const host = u.hostname.replace(/^www\./, "");
  const path = u.pathname;

  if (/\.(mp3|wav|m4a|ogg)$/i.test(path)) return { kind: "audio", src: url, label: "Audio" };
  if (/\.(mp4|webm|mov)$/i.test(path)) return { kind: "video", src: url, aspect: 16 / 9, label: "Video" };

  if (host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id = host === "youtu.be" ? path.slice(1) : u.searchParams.get("v") || path.split("/").filter(Boolean).pop() || "";
    const vertical = path.startsWith("/shorts/");
    return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}`, aspect: vertical ? 9 / 16 : 16 / 9, label: "YouTube" };
  }
  if (host.endsWith("vimeo.com")) {
    const id = path.split("/").filter(Boolean).pop() || "";
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${id}`, aspect: 16 / 9, label: "Vimeo" };
  }
  if (host.endsWith("tiktok.com")) {
    const id = path.match(/\/video\/(\d+)/)?.[1] || path.match(/\/embed\/v2\/(\d+)/)?.[1];
    if (id) return { kind: "tiktok", src: `https://www.tiktok.com/embed/v2/${id}`, height: 740, label: "TikTok" };
    return { kind: "link", src: url, label: "TikTok" };
  }
  if (host.endsWith("instagram.com")) {
    const m = path.match(/\/(p|reel|tv)\/([^/]+)/);
    if (m) return { kind: "instagram", src: `https://www.instagram.com/${m[1]}/${m[2]}/embed`, height: 620, label: "Instagram" };
    return { kind: "link", src: url, label: "Instagram" };
  }
  if (host === "open.spotify.com") {
    const m = path.replace(/^\/embed/, "").match(/\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
    if (m) return { kind: "spotify", src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, height: m[1] === "track" || m[1] === "episode" ? 152 : 352, label: "Spotify" };
  }
  if (host.endsWith("music.apple.com")) {
    return { kind: "apple", src: `https://embed.music.apple.com${path}${u.search}`, height: 450, label: "Apple Music" };
  }
  if (host.endsWith("soundcloud.com")) {
    return { kind: "soundcloud", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f5c518`, height: 166, label: "SoundCloud" };
  }
  return { kind: "link", src: url, label: host };
}

export function spotifyPlaylistEmbed(id: string): string {
  return `https://open.spotify.com/embed/playlist/${id}`;
}
