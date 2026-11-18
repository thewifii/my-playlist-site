import { ArrowRight, ArrowUpRight, Briefcase, Headphones, Mail, Music2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic, Reveal } from "@/components/motion";
import { CompactCard, OverlayCard, PostCard, SectionHeading } from "@/components/site/cards";
import { ComingSoon } from "@/components/site/coming-soon";
import { SiteFooter } from "@/components/site/site-footer";
import { TikTokIcon, Wordmark } from "@/components/site/site-header";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { listPublished } from "@/lib/repo";
import { COMING_SOON, SHOWS, site, socials } from "@/lib/site";
import { formatDate, pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${site.network}` },
  description: site.description,
  alternates: { canonical: "/" },
};

const quickLinks = [
  { href: "/portfolio", title: "Portfolio", text: "TikTok Shop, UGC and brand campaign work. Start a brand inquiry.", icon: Briefcase },
  { href: "/contact", title: "Contact", text: "Press, collaborations and general questions.", icon: Mail },
  { href: "/iamtheculture/podcasts", title: "Podcasts", text: "Two shows. New episodes every week.", icon: Headphones },
  { href: "/iamtheculture/music", title: "Music", text: "Beats, reference tracks and commercial sounds.", icon: Music2 },
];

const marquee = ["Culture Lives Here", "Music", "Fashion", "Film & TV", "Creator Economy", "Podcasts", "Playlists", "Merch"];

export default async function LandingPage() {
  // Temporary pre-launch page. Remove this line (and the ComingSoon import) once COMING_SOON is false for good.
  if (COMING_SOON && !(await getSession())) return <ComingSoon />;

  const [posts, episodes] = await Promise.all([listPublished("posts"), listPublished("episodes")]);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const recent = posts.filter((p) => p.id !== featured?.id);
  const episode = episodes[0];

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container-site flex h-16 items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button asChild size="lg" variant="outline" className="h-10 px-4 font-bold">
              <Link href="/home">
                Enter site <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold/15 blur-[140px]" />
          <div className="container-site grid min-h-[92svh] items-center gap-10 pt-28 pb-14 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="kicker mb-6 inline-flex items-center gap-2 text-highlight">
                  <span className="size-2 rounded-full bg-gold" /> Creator · Curator · Producer
                </p>
                <h1 className="font-heading leading-[0.86] font-bold tracking-tighter uppercase">
                  <span className="block text-[19vw] lg:text-[11.5vw] 2xl:text-[200px]">
                    The <span className="text-highlight">Wifii</span>
                  </span>
                  <span className="mt-3 block text-[7.2vw] tracking-tight text-foreground/90 lg:text-[4.3vw] 2xl:text-[76px]">Culture Lives Here</span>
                </h1>
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
                  Music, fashion, film and the creator economy from The Wifii and the Culture Lives Here network. Reviews, podcasts, beats, playlists and the playbooks behind them.
                </p>
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <Button asChild size="lg" className="h-14 gap-2 px-7 text-base font-bold">
                      <Link href="/home">
                        Enter the site <ArrowRight className="size-5" />
                      </Link>
                    </Button>
                  </Magnetic>
                  <Button asChild size="lg" variant="outline" className="h-14 px-6 text-base font-bold">
                    <Link href="/portfolio">Portfolio</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-6 text-base font-bold">
                    <Link href="/contact">Contact</Link>
                  </Button>
                </div>
              </div>
              <div className="animate-in fade-in duration-700 delay-300 fill-mode-both">
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
                  {socials.map((s) => (
                    <a key={s.handle} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-foreground/80 underline-offset-4 hover:text-highlight hover:underline">
                      <TikTokIcon className="size-4" /> {s.handle}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid animate-in gap-4 fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
              {featured ? <OverlayCard post={featured} size="sm" priority className="min-h-[340px] lg:min-h-[400px]" /> : null}
              {episode ? (
                <Link href="/iamtheculture/podcasts" className="group flex items-center gap-4 rounded-md border border-border bg-card p-4 transition-colors hover:border-gold">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <Headphones className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="kicker block text-muted-foreground">
                      Latest episode · #{pad(episode.number, 3)} · {SHOWS[episode.show].name}
                    </span>
                    <span className="mt-1 block truncate font-heading text-lg font-bold group-hover:text-highlight">{episode.title}</span>
                  </span>
                  <ArrowUpRight className="ml-auto size-5 shrink-0 text-muted-foreground group-hover:text-highlight" />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-ink bg-gold py-3 text-ink" aria-hidden="true">
          <div className="flex w-max animate-marquee gap-8 font-heading text-lg font-bold whitespace-nowrap uppercase">
            {[...marquee, ...marquee, ...marquee, ...marquee].map((word, i) => (
              <span key={i} className="flex items-center gap-8">
                {word} <span className="size-1.5 rounded-full bg-ink" />
              </span>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <section className="container-site py-16 lg:py-24">
          <SectionHeading kicker="Fresh off the feed" title="Latest posts" href="/home" linkLabel="Go to home" />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((post, i) => (
              <Reveal key={post.id} delay={i * 0.06}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12 grid gap-6 border-t border-border pt-10 md:grid-cols-2 xl:grid-cols-3">
            {recent.slice(3, 9).map((post) => (
              <CompactCard key={post.id} post={post} />
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Updated {formatDate(posts[0]?.published_at)}</p>
        </section>

        {/* Quick access */}
        <section className="border-t border-border bg-card">
          <div className="container-site py-16 lg:py-20">
            <SectionHeading kicker="Quick access" title="Where to next" />
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map((q, i) => (
                <li key={q.href}>
                  <Reveal delay={i * 0.05}>
                    <Link href={q.href} className="group flex h-full min-h-48 flex-col justify-between rounded-md border border-border bg-background p-6 transition-colors hover:border-gold hover:bg-gold hover:text-ink">
                      <q.icon className="size-7 text-highlight group-hover:text-ink" />
                      <span>
                        <span className="flex items-center justify-between font-heading text-2xl font-bold">
                          {q.title} <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                        <span className="mt-2 block text-sm leading-snug text-muted-foreground group-hover:text-ink/75">{q.text}</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
