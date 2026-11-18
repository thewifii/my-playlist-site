"use client";

import { Clock } from "lucide-react";
import * as React from "react";
import { Img } from "@/components/media";
import { PlayButton, usePlayer, Waveform, type PlayerTrack } from "@/components/player";
import { RichTextLite } from "@/components/site/rich-text-lite";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SHOWS, type ShowKey } from "@/lib/site";
import type { Episode } from "@/lib/types";
import { cn, formatDate, formatDuration, pad } from "@/lib/utils";

const PLATFORMS = [
  { key: "spotify_url", label: "Spotify" },
  { key: "apple_url", label: "Apple Podcasts" },
  { key: "youtube_url", label: "YouTube" },
] as const;

function toTrack(e: Episode): PlayerTrack {
  return { id: e.id, title: e.title, subtitle: `${SHOWS[e.show].name} · #${pad(e.number, 3)}`, src: e.audio_url, cover: e.cover_image };
}

function parseGuest(line: string) {
  const [name, avatar] = line.split("|").map((s) => s.trim());
  return { name, avatar, initials: name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() };
}

function PlatformBadges({ episode, className }: { episode: Episode; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Listen on">
      {PLATFORMS.filter((p) => episode[p.key]).map((p) => (
        <li key={p.key}>
          <a
            href={episode[p.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="kicker inline-flex h-8 items-center rounded-full border border-border px-3 transition-colors hover:border-gold hover:bg-gold hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {p.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Guests({ guests }: { guests: string[] }) {
  if (guests.length === 0) return null;
  const parsed = guests.map(parseGuest);
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {parsed.map((g) => (
          <Avatar key={g.name} className="size-9 border-2 border-background">
            {g.avatar ? <AvatarImage src={g.avatar} alt="" /> : null}
            <AvatarFallback className="text-xs font-bold">{g.initials}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">With </span>
        <span className="font-bold">{parsed.map((g) => g.name).join(" & ")}</span>
      </p>
    </div>
  );
}

function ShowPanel({ show, episodes }: { show: ShowKey; episodes: Episode[] }) {
  const { current, playing } = usePlayer();
  const meta = SHOWS[show];
  const [latest, ...older] = episodes;
  if (!latest) return <p className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">No episodes published yet.</p>;

  return (
    <div>
      {/* Latest episode */}
      <article className="grid overflow-hidden rounded-md border border-border bg-card lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="relative min-h-64 bg-ink">
          <Img src={latest.cover_image} alt="" priority className="absolute inset-0" />
          <span className="absolute top-4 left-4 bg-gold px-3 py-1.5 font-heading text-2xl font-bold text-ink tabular-nums">#{pad(latest.number, 3)}</span>
        </div>
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="kicker text-highlight">Latest episode · {formatDate(latest.published_at)}</p>
          <h2 className="mt-3 text-3xl leading-tight font-bold text-balance sm:text-4xl">{latest.title}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{latest.description}</p>
          <div className="mt-5">
            <Guests guests={latest.guests} />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <PlayButton track={toTrack(latest)} size="lg" />
            <div className="min-w-0 flex-1">
              <Waveform id={latest.id} bars={64} />
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Clock className="size-3" /> {formatDuration(latest.duration)}
              </p>
            </div>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics">
            {latest.tags.map((t) => (
              <li key={t}>
                <Badge variant="outline">{t}</Badge>
              </li>
            ))}
          </ul>
          <PlatformBadges episode={latest} className="mt-5" />
          {latest.show_notes ? (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="notes">
                <AccordionTrigger className="kicker">Show notes</AccordionTrigger>
                <AccordionContent>
                  <RichTextLite text={latest.show_notes} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      </article>

      {/* Archive */}
      <h3 className="kicker mt-12 mb-2 text-muted-foreground">
        All episodes · {meta.cadence}
      </h3>
      <Accordion type="single" collapsible className="border-t-2 border-foreground">
        {older.map((e) => {
          const active = current?.id === e.id && playing;
          return (
            <AccordionItem key={e.id} value={e.id} className="border-b border-border">
              <div className="flex items-start gap-4 py-5 sm:gap-6">
                <span className={cn("w-16 shrink-0 pt-1 font-heading text-2xl font-bold tabular-nums sm:w-20 sm:text-3xl", active ? "text-highlight" : "text-espresso")}>#{pad(e.number, 3)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(e.published_at)} · {formatDuration(e.duration)}
                  </p>
                  <h4 className="mt-1 text-xl leading-snug font-bold text-balance">{e.title}</h4>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Guests guests={e.guests} />
                    <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
                      {e.tags.map((t) => (
                        <li key={t}>
                          <Badge variant="outline">{t}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <AccordionTrigger className="kicker mt-2 w-auto justify-start gap-2 py-2 text-muted-foreground hover:text-foreground">Show notes &amp; links</AccordionTrigger>
                </div>
                <PlayButton track={toTrack(e)} className="mt-1" />
              </div>
              <AccordionContent className="pb-6 pl-20 sm:pl-[6.5rem]">
                <RichTextLite text={e.show_notes || "Show notes coming soon."} />
                <PlatformBadges episode={e} className="mt-4" />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export function PodcastHub({ episodes }: { episodes: Episode[] }) {
  const shows = Object.keys(SHOWS) as ShowKey[];
  const [show, setShow] = React.useState<ShowKey>(shows[0]);
  return (
    <Tabs value={show} onValueChange={(v) => setShow(v as ShowKey)}>
      <TabsList className="grid h-auto! w-full grid-cols-1 gap-3 rounded-none bg-transparent p-0 sm:grid-cols-2">
        {shows.map((key) => (
          <TabsTrigger
            key={key}
            value={key}
            className="h-auto flex-col items-start gap-1 rounded-md border border-border bg-card p-5 text-left whitespace-normal data-active:border-gold! data-active:bg-gold! data-active:text-ink! data-active:shadow-none! dark:data-active:border-gold! dark:data-active:bg-gold! dark:data-active:text-ink!"
          >
            <span className="kicker opacity-70">{episodes.filter((e) => e.show === key).length} episodes</span>
            <span className="font-heading text-xl leading-tight font-bold sm:text-2xl">{SHOWS[key].name}</span>
            <span className="text-sm leading-snug font-normal opacity-80">{SHOWS[key].tagline}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {shows.map((key) => (
        <TabsContent key={key} value={key} className="mt-8">
          <ShowPanel show={key} episodes={episodes.filter((e) => e.show === key)} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
