"use client";

import { Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn, formatDuration } from "@/lib/utils";

export interface PlayerTrack {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  cover?: string;
}

interface PlayerState {
  current: PlayerTrack | null;
  playing: boolean;
  time: number;
  duration: number;
  play: (track: PlayerTrack) => void;
  toggle: (track?: PlayerTrack) => void;
  seek: (seconds: number) => void;
  close: () => void;
}

const PlayerContext = React.createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = React.useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/** One shared <audio> element for the whole site, with a sticky bottom player bar. */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = React.useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const play = React.useCallback((track: PlayerTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.getAttribute("data-id") !== track.id) {
      audio.src = track.src;
      audio.setAttribute("data-id", track.id);
      setTime(0);
      setDuration(0);
    }
    setCurrent(track);
    void audio.play().catch(() => setPlaying(false));
  }, []);

  const toggle = React.useCallback(
    (track?: PlayerTrack) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (track && audio.getAttribute("data-id") !== track.id) return play(track);
      if (audio.paused) void audio.play().catch(() => setPlaying(false));
      else audio.pause();
    },
    [play],
  );

  const seek = React.useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setTime(seconds);
  }, []);

  const close = React.useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.removeAttribute("data-id");
      audio.load();
    }
    setCurrent(null);
    setPlaying(false);
  }, []);

  const value = React.useMemo(() => ({ current, playing, time, duration, play, toggle, seek, close }), [current, playing, time, duration, play, toggle, seek, close]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        className="hidden"
      />
      <PlayerBar />
    </PlayerContext.Provider>
  );
}

function PlayerBar() {
  const { current, playing, time, duration, toggle, seek, close } = usePlayer();
  const total = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return (
    <>
      {current ? <div aria-hidden="true" className="h-24" /> : null}
      <AnimatePresence>
        {current ? (
          <motion.div
            role="region"
            aria-label="Audio player"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md"
          >
            <div className="container-site flex items-center gap-3 py-3 sm:gap-5">
              <Button size="icon-lg" onClick={() => toggle()} aria-label={playing ? "Pause" : "Play"} className="size-11 shrink-0 rounded-full">
                {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5 translate-x-px" fill="currentColor" />}
              </Button>
              {current.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.cover} alt="" className="hidden size-11 shrink-0 rounded object-cover sm:block" />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-bold">{current.title}</p>
                  <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDuration(time)} / {formatDuration(total)}
                  </p>
                </div>
                {current.subtitle ? <p className="truncate text-xs text-muted-foreground">{current.subtitle}</p> : null}
                <Slider
                  className="mt-2 [&_[data-slot=slider-range]]:bg-gold"
                  min={0}
                  max={total || 1}
                  step={1}
                  value={[Math.min(time, total || 1)]}
                  onValueChange={([v]) => seek(v)}
                  aria-label="Seek"
                  disabled={!total}
                />
              </div>
              <Button variant="ghost" size="icon-lg" onClick={close} aria-label="Close player" className="shrink-0">
                <X className="size-4" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** Round play/pause button bound to a track. Shows pause while that track is the one playing. */
export function PlayButton({ track, className, size = "md" }: { track: PlayerTrack; className?: string; size?: "sm" | "md" | "lg" }) {
  const { current, playing, toggle } = usePlayer();
  const active = current?.id === track.id && playing;
  const dims = size === "lg" ? "size-14" : size === "sm" ? "size-9" : "size-11";
  const icon = size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5";
  return (
    <button
      type="button"
      onClick={() => toggle(track)}
      aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`}
      aria-pressed={active}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gold text-ink transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95",
        dims,
        className,
      )}
    >
      {active ? <Pause className={icon} fill="currentColor" /> : <Play className={cn(icon, "translate-x-px")} fill="currentColor" />}
    </button>
  );
}

/** Decorative waveform that animates while its track is playing. Bars are seeded from the id so each track looks different. */
export function Waveform({ id, className, bars = 48 }: { id: string; className?: string; bars?: number }) {
  const { current, playing, time, duration } = usePlayer();
  const active = current?.id === id;
  const progress = active && duration > 0 ? time / duration : 0;
  const heights = React.useMemo(() => {
    let seed = 0;
    for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    return Array.from({ length: bars }, (_, i) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const noise = (seed >>> 8) / 0xffffff;
      return 0.25 + 0.75 * Math.abs(Math.sin(i * 0.45 + noise * 2)) * (0.55 + noise * 0.45);
    });
  }, [id, bars]);
  return (
    <div className={cn("flex h-10 items-center gap-[2px]", className)} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("w-full min-w-[2px] rounded-full transition-colors", i / bars < progress ? "bg-gold" : "bg-foreground/25", active && playing && "animate-pulse")}
          style={{ height: `${(h * 100).toFixed(1)}%`, animationDelay: `${(i % 6) * 90}ms` }}
        />
      ))}
    </div>
  );
}
