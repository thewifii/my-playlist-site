import { ExternalLink } from "lucide-react";
import { resolveEmbed } from "@/lib/embed";
import { cn } from "@/lib/utils";

export function Img({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  if (!src) return <div className={cn("h-full w-full bg-muted", className)} role="img" aria-label={alt} />;
  return (
    // Remote sample and R2-hosted media: a plain <img> avoids needing an image optimisation service.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("h-full w-full object-cover", className)} />
  );
}

/** Renders any supported media URL: YouTube, Vimeo, TikTok, Instagram, Spotify, Apple Music, SoundCloud, mp3 or mp4. */
export function Embed({ url, className, title }: { url: string; className?: string; title?: string }) {
  const e = resolveEmbed(url);
  const frameTitle = title || `${e.label} player`;

  if (e.kind === "audio") {
    return <audio controls preload="none" src={e.src} className={cn("w-full", className)} />;
  }
  if (e.kind === "video") {
    return <video controls playsInline preload="metadata" src={e.src} className={cn("aspect-video w-full rounded-lg bg-black", className)} />;
  }
  if (e.kind === "link") {
    return (
      <a href={e.src} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4", className)}>
        {e.label} <ExternalLink className="size-3.5" />
      </a>
    );
  }
  const narrow = e.kind === "tiktok" || e.kind === "instagram";
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card", narrow && "mx-auto max-w-[360px]", className)} style={e.height ? { height: e.height } : { aspectRatio: String(e.aspect ?? 16 / 9) }}>
      <iframe
        src={e.src}
        title={frameTitle}
        loading="lazy"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
