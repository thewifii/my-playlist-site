import { ArrowUpRight, Mic2, Music2, PenLine, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/media";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/site/cards";
import { TikTokIcon } from "@/components/site/site-header";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { audienceStats, brandHighlights, pressHighlights, site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "The Wifii is a creator, cultural curator, producer and the founder of Culture Lives Here.",
  alternates: { canonical: "/about" },
};

const roles = [
  { icon: Video, title: "Creator", text: "Short-form video, TikTok Shop content and UGC that converts because it sounds like a person, not an ad." },
  { icon: PenLine, title: "Cultural Curator", text: "Reviews, essays and playlists that connect music, fashion and film through one point of view." },
  { icon: Music2, title: "Producer", text: "Beats, reference tracks and commercially cleared sounds used by artists and TikTok Shop sellers." },
  { icon: Mic2, title: "Founder", text: "Culture Lives Here: a media network with two podcasts, an editorial desk and a merch line." },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="container-site grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16 lg:py-20">
          <div>
            <p className="kicker mb-4 text-highlight">About</p>
            <h1 className="text-6xl leading-[0.9] font-bold tracking-tighter uppercase sm:text-7xl lg:text-8xl 2xl:text-9xl">
              The <span className="text-highlight">Wifii</span>
            </h1>
            <p className="mt-4 font-heading text-xl font-medium text-muted-foreground sm:text-2xl">Creator, cultural curator, producer and founder of Culture Lives Here.</p>
            <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-pretty text-foreground/90">
              <p>
                The Wifii makes things people share: videos that move product, beats that end up under thousands of other creators&rsquo; videos, and reviews people argue about in the comments.
              </p>
              <p>
                Culture Lives Here grew out of that work. It is a home for the conversations around music, fashion, film and the creator economy, told by people who make the culture rather than just cover it.
              </p>
              <p className="text-base text-muted-foreground">This bio is placeholder copy for V1. Replace it with your own story.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map((s) => (
                <Button key={s.handle} asChild size="lg" className="h-12 gap-2 px-5 text-base font-bold">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    <TikTokIcon className="size-4" /> {s.handle}
                    <span className="sr-only"> on TikTok</span>
                  </a>
                </Button>
              ))}
              <Button asChild size="lg" variant="outline" className="h-12 px-5 text-base font-bold">
                <Link href="/portfolio#inquiry">Work together</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-md bg-muted">
              <AspectRatio ratio={4 / 5}>
                <Img src="https://picsum.photos/seed/wifii-portrait/900/1125" alt="Placeholder portrait for The Wifii" priority />
              </AspectRatio>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-md bg-gold px-5 py-4 text-ink sm:block">
              <p className="kicker">Founder</p>
              <p className="font-heading text-xl leading-tight font-bold">Culture Lives Here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Audience stats */}
      <section className="container-site py-14 lg:py-20">
        <SectionHeading kicker="By the numbers" title="Audience" />
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {audienceStats.map((stat, i) => (
            <li key={stat.label}>
              <Reveal delay={i * 0.06}>
                <Card className="h-full border-t-4 border-t-gold">
                  <CardContent>
                    <p className="font-heading text-5xl leading-none font-bold tabular-nums lg:text-6xl">{stat.value}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Sample figures. Update them in src/lib/site.ts.</p>
      </section>

      {/* What I do */}
      <section className="border-y border-border bg-card">
        <div className="container-site py-14 lg:py-20">
          <SectionHeading kicker="The work" title="Four jobs, one voice" />
          <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => (
              <li key={role.title} className="bg-background p-6 lg:p-8">
                <role.icon className="size-7 text-highlight" />
                <h3 className="mt-5 text-2xl font-bold">{role.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Press + brands */}
      <section className="container-site grid gap-14 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <SectionHeading kicker="Press" title="In the press" />
          <ul className="space-y-8">
            {pressHighlights.map((p) => (
              <li key={p.outlet} className="border-l-4 border-espresso pl-5">
                <blockquote className="font-heading text-2xl leading-snug font-medium text-balance">&ldquo;{p.quote}&rdquo;</blockquote>
                <p className="kicker mt-3 text-muted-foreground">
                  {p.outlet} · {p.year}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeading kicker="Partners" title="Brands" />
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
            {brandHighlights.map((brand) => (
              <li key={brand} className="grid h-24 place-items-center bg-background px-4 text-center font-heading text-lg font-bold text-foreground/80">
                {brand}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Sample names and quotes. Update them in src/lib/site.ts.</p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 text-base font-bold">
            <Link href="/portfolio">
              See the portfolio <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-gold text-ink">
        <div className="container-site flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <h2 className="text-3xl leading-tight font-bold text-balance sm:text-4xl">Press, speaking or a collaboration in mind?</h2>
          <Button asChild size="lg" className="h-12 bg-ink px-6 text-base font-bold text-white hover:bg-ink/85">
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </Button>
        </div>
      </section>
    </>
  );
}
