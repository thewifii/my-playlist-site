"use client";

import { Check, ExternalLink, Lightbulb, Loader2, ShoppingBag } from "lucide-react";
import * as React from "react";
import { PlayButton, Waveform, type PlayerTrack } from "@/components/player";
import { submitForm } from "@/components/site/forms";
import { TikTokIcon } from "@/components/site/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CML_FAQ } from "@/lib/cml-faq";
import type { Track } from "@/lib/types";
import { cn, formatDuration, formatPrice } from "@/lib/utils";

type Tier = "mp3" | "wav" | "stems";
const TIERS: { value: Tier; label: string; field: "price_mp3" | "price_wav" | "price_stems"; terms: string }[] = [
  { value: "mp3", label: "MP3", field: "price_mp3", terms: "Tagless MP3 · non-exclusive lease" },
  { value: "wav", label: "WAV", field: "price_wav", terms: "Tagless WAV + MP3 · non-exclusive lease" },
  { value: "stems", label: "Stems", field: "price_stems", terms: "Tracked-out stems + WAV · unlimited lease" },
];

function toPlayer(t: Track): PlayerTrack {
  return { id: t.id, title: t.title, subtitle: `${t.artist} · ${t.bpm} BPM · ${t.musical_key}`, src: t.audio_url, cover: t.cover_image };
}

function LicenseDialog({ track, tier, onClose }: { track: Track | null; tier: Tier; onClose: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState("");
  const t = TIERS.find((x) => x.value === tier)!;

  React.useEffect(() => {
    if (track) {
      setState("idle");
      setError("");
    }
  }, [track]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!track) return;
    setState("sending");
    const res = await submitForm("beat-inquiry", name, email, { track: track.title, trackId: track.id, catalog: track.kind, license: t.label, price: track[t.field], notes });
    if (res.ok) setState("done");
    else {
      setError(res.error ?? "Something went wrong.");
      setState("idle");
    }
  }

  return (
    <Dialog open={track !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {track ? (
          state === "done" ? (
            <div className="py-6 text-center" role="status">
              <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gold text-ink">
                <Check className="size-7" />
              </span>
              <DialogTitle className="font-heading text-2xl font-bold">Request sent.</DialogTitle>
              <DialogDescription className="mt-2">
                We&rsquo;ll email the license agreement and a payment link for &ldquo;{track.title}&rdquo; ({t.label}) to {email}.
              </DialogDescription>
              <Button className="mt-6" variant="outline" onClick={onClose}>
                Back to the catalog
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold">License &ldquo;{track.title}&rdquo;</DialogTitle>
                <DialogDescription>
                  {track.bpm} BPM · {track.musical_key} · {track.genre}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between rounded-md border border-gold/60 bg-gold/10 p-4">
                <div>
                  <p className="font-bold">{t.label} license</p>
                  <p className="text-xs text-muted-foreground">{t.terms}</p>
                </div>
                <p className="font-heading text-3xl font-bold tabular-nums">{formatPrice(track[t.field])}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lic-name">Name / artist name</Label>
                  <Input id="lic-name" required autoComplete="name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lic-email">Email</Label>
                  <Input id="lic-email" type="email" required autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lic-notes">Notes (optional)</Label>
                <Textarea id="lic-notes" rows={3} placeholder="Release plans, exclusive rights, custom edits…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-5 font-bold" disabled={state === "sending"}>
                  {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />} Request license
                </Button>
              </DialogFooter>
              <p className="text-xs text-muted-foreground">No payment is taken here. You&rsquo;ll get the agreement and a secure payment link by email.</p>
            </form>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ForSaleList({ tracks, onLicense }: { tracks: Track[]; onLicense: (track: Track, tier: Tier) => void }) {
  const [tiers, setTiers] = React.useState<Record<string, Tier>>({});
  return (
    <ItemGroup className="gap-3">
      {tracks.map((t) => {
        const tier = tiers[t.id] ?? "mp3";
        const selected = TIERS.find((x) => x.value === tier)!;
        return (
          <Item key={t.id} variant="outline" className="flex-wrap gap-4 bg-card p-4 sm:flex-nowrap">
            <ItemMedia>
              <PlayButton track={toPlayer(t)} />
            </ItemMedia>
            <ItemContent className="min-w-0 basis-40">
              <ItemTitle className="font-heading text-lg font-bold">{t.title}</ItemTitle>
              <ItemDescription className="tabular-nums">
                <span className="font-bold text-foreground">{t.bpm} BPM</span> · {t.musical_key} · {t.genre} · {formatDuration(t.duration)}
              </ItemDescription>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {t.moods.map((m) => (
                  <Badge key={m} variant="outline">
                    {m}
                  </Badge>
                ))}
              </div>
            </ItemContent>
            <Waveform id={t.id} bars={40} className="hidden w-40 xl:flex 2xl:w-64" />
            <ItemActions className="w-full flex-wrap justify-between gap-3 sm:w-auto sm:flex-nowrap">
              <div role="radiogroup" aria-label={`License tier for ${t.title}`} className="flex rounded-full border border-border p-0.5">
                {TIERS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={tier === opt.value}
                    onClick={() => setTiers((p) => ({ ...p, [t.id]: opt.value }))}
                    className={cn("h-8 rounded-full px-3 text-xs font-bold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", tier === opt.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Button className="h-10 min-w-28 gap-2 px-4 font-bold tabular-nums" onClick={() => onLicense(t, tier)}>
                {formatPrice(t[selected.field])} <span className="font-normal">License</span>
              </Button>
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

const TAB_VALUES = ["beats", "reference", "cml"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export function MusicHub({ tracks, initialTab }: { tracks: Track[]; initialTab?: string }) {
  const [tab, setTab] = React.useState<TabValue>(TAB_VALUES.find((t) => t === initialTab) ?? "beats");
  const [licensing, setLicensing] = React.useState<{ track: Track; tier: Tier } | null>(null);
  const beats = tracks.filter((t) => t.kind === "beat");
  const refs = tracks.filter((t) => t.kind === "reference");
  const cml = tracks.filter((t) => t.kind === "cml");

  function onTab(value: string) {
    setTab(value as TabValue);
    window.history.replaceState(null, "", value === "beats" ? window.location.pathname : `?tab=${value}`);
  }

  const trigger =
    "kicker h-12 flex-none rounded-none border-0 border-b-2 border-transparent px-4 text-muted-foreground data-active:border-gold! data-active:bg-transparent! data-active:text-foreground! data-active:shadow-none! dark:data-active:border-gold! dark:data-active:bg-transparent!";

  return (
    <>
      <Tabs value={tab} onValueChange={onTab}>
        <TabsList className="no-scrollbar h-auto! w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="beats" className={trigger}>
            Beats for Sale <span className="ml-2 tabular-nums">{beats.length}</span>
          </TabsTrigger>
          <TabsTrigger value="reference" className={trigger}>
            Reference Tracks <span className="ml-2 tabular-nums">{refs.length}</span>
          </TabsTrigger>
          <TabsTrigger value="cml" className={trigger}>
            Commercial Sounds for TikTok Shop <span className="ml-2 tabular-nums">{cml.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* forceMount keeps every catalog in the HTML so search engines can read all three */}
        <TabsContent value="beats" forceMount className="mt-8 data-[state=inactive]:hidden">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-bold">Beats for Sale</h2>
            <p className="mt-2 text-muted-foreground">Preview any beat, pick a license tier and request it. Stems include every tracked-out sound.</p>
          </div>
          <ForSaleList tracks={beats} onLicense={(track, tier) => setLicensing({ track, tier })} />
        </TabsContent>

        <TabsContent value="reference" forceMount className="mt-8 data-[state=inactive]:hidden">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-bold">Reference Tracks for Sale</h2>
            <p className="mt-2 text-muted-foreground">Full vocal demos for artists and labels: topline, lyrics and production ready to cut. Every purchase includes the session notes.</p>
          </div>
          <ForSaleList tracks={refs} onLicense={(track, tier) => setLicensing({ track, tier })} />
        </TabsContent>

        <TabsContent value="cml" forceMount className="mt-8 data-[state=inactive]:hidden">
          <section aria-labelledby="cml-heading">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
              <div>
                <p className="kicker text-highlight">TikTok Commercial Music Library</p>
                <h2 id="cml-heading" className="mt-2 text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
                  Commercial Sounds for TikTok Shop Creators
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Free, pre-cleared music for shoppable videos. Every track below is available in the TikTok Commercial Music Library (CML), so it is safe to use on TikTok Shop videos, affiliate content, brand posts and ads. Preview a sound, then open it on TikTok in one tap.
                </p>
              </div>
              <aside className="rounded-md border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 font-heading text-lg font-bold">
                  <Lightbulb className="size-5 text-highlight" /> Usage tips
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-gold">
                  <li>Add the sound before you post, not after: it keeps your video eligible for promotion.</li>
                  <li>Match the tempo to the edit. Fast cuts want 115+ BPM, routines and voiceovers want under 100.</li>
                  <li>Keep the music under your voice. Set the sound to around 10–15% when you&rsquo;re talking.</li>
                  <li>Reuse one sound across a product series so viewers recognise your videos.</li>
                </ul>
              </aside>
            </div>

            <h3 className="kicker mt-10 mb-3 text-muted-foreground">All commercial sounds by The Wifii</h3>
            <ItemGroup className="gap-3">
              {cml.map((t) => (
                <Item key={t.id} variant="outline" className="flex-wrap gap-4 bg-card p-4 md:flex-nowrap">
                  <ItemMedia>
                    <PlayButton track={toPlayer(t)} />
                  </ItemMedia>
                  <ItemContent className="min-w-0 basis-56">
                    <ItemTitle className="font-heading text-lg font-bold">
                      <h4>{t.title}</h4>
                    </ItemTitle>
                    <ItemDescription className="tabular-nums">
                      <span className="font-bold text-foreground">{t.bpm} BPM</span> · {t.musical_key} · {t.genre} · {formatDuration(t.duration)}
                    </ItemDescription>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    <p className="mt-1 text-sm">
                      <span className="font-bold">Best for: </span>
                      {t.moods.join(", ")}
                    </p>
                    {t.usage_tip ? (
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-highlight" /> {t.usage_tip}
                      </p>
                    ) : null}
                  </ItemContent>
                  <ItemActions className="w-full md:w-auto">
                    <Button asChild className="h-10 w-full gap-2 px-4 font-bold md:w-auto">
                      <a href={t.tiktok_url || "https://www.tiktok.com/@thewifii_"} target="_blank" rel="noopener noreferrer">
                        <TikTokIcon className="size-4" /> Use on TikTok <ExternalLink className="size-3.5" />
                        <span className="sr-only">: {t.title}</span>
                      </a>
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>

            <h3 className="mt-14 text-2xl font-bold sm:text-3xl">Commercial sounds FAQ</h3>
            <Accordion type="single" collapsible className="mt-4 border-t border-border">
              {CML_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="py-5 text-left text-base font-bold">{f.q}</AccordionTrigger>
                  <AccordionContent forceMount className="max-w-3xl text-base leading-relaxed text-muted-foreground data-[state=closed]:hidden">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </TabsContent>
      </Tabs>

      <LicenseDialog track={licensing?.track ?? null} tier={licensing?.tier ?? "mp3"} onClose={() => setLicensing(null)} />
    </>
  );
}
