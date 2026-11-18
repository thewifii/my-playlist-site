import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FlameBadge } from "@/components/flame-meter";
import { Img } from "@/components/media";
import { Reveal } from "@/components/motion";
import { PlayButton, Waveform } from "@/components/player";
import { CategoryLabel, OverlayCard, PostCard, SectionHeading, postHref } from "@/components/site/cards";
import { TikTokIcon } from "@/components/site/site-header";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPublished } from "@/lib/repo";
import { SHOWS, socials } from "@/lib/site";
import { formatDate, formatDuration, formatPrice, pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "The latest from The Wifii and Culture Lives Here: reviews, trending stories, reels, podcasts, beats and merch.",
  alternates: { canonical: "/home" },
};

export default async function HomePage() {
  const [posts, episodes, tracks, products, portfolio] = await Promise.all([
    listPublished("posts"),
    listPublished("episodes"),
    listPublished("tracks"),
    listPublished("products"),
    listPublished("portfolio"),
  ]);

  const culture = posts.filter((p) => p.type !== "creator");
  const hero = culture.find((p) => p.featured) ?? culture[0];
  const side = culture.filter((p) => p.id !== hero?.id).slice(0, 3);
  const trending = culture.filter((p) => p.id !== hero?.id).slice(3, 9);
  const creator = posts.filter((p) => p.type === "creator").slice(0, 3);
  const episode = episodes[0];
  const sounds = [...tracks.filter((t) => t.kind === "beat").slice(0, 2), ...tracks.filter((t) => t.kind === "cml").slice(0, 2)];
  const drop = products.find((p) => p.badge === "New Drop") ?? products[0];
  const moreMerch = products.filter((p) => p.id !== drop?.id).slice(0, 2);
  const reels = portfolio.filter((p) => p.media_type === "video" || p.media_type === "tiktok").slice(0, 6);

  return (
    <>
      {/* Hero editorial grid: 1 featured + 3 trending */}
      <section className="container-site py-6 lg:py-8">
        <h1 className="sr-only">The Wifii — Culture Lives Here</h1>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {hero ? <OverlayCard post={hero} priority className="min-h-[460px] lg:min-h-[640px]" /> : null}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {side.map((post) => (
              <article key={post.id} className="group relative isolate overflow-hidden rounded-md bg-ink text-white">
                <AspectRatio ratio={16 / 9}>
                  <Img src={post.cover_image} alt="" className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <CategoryLabel>{post.category}</CategoryLabel>
                    {post.type === "review" && post.flame_score != null ? <FlameBadge score={post.flame_score} /> : null}
                  </div>
                  <h2 className="absolute inset-x-0 bottom-0 p-4 text-lg leading-snug font-bold text-balance">
                    <Link href={postHref(post)} className="after:absolute after:inset-0 group-hover:text-gold focus-visible:underline focus-visible:outline-none">
                      {post.title}
                    </Link>
                  </h2>
                </AspectRatio>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trending in Culture: numbered list */}
      <section className="container-site py-12 lg:py-16">
        <SectionHeading kicker="Right now" title="Trending in Culture" href="/iamtheculture/culture-lives-here" />
        <ol className="grid gap-x-10 md:grid-cols-2 xl:grid-cols-3">
          {trending.map((post, i) => (
            <li key={post.id}>
              <Reveal delay={(i % 3) * 0.05}>
                <article className="group relative flex items-start gap-5 border-b border-border py-6">
                  <span className="font-heading text-6xl leading-none font-bold text-transparent tabular-nums transition-colors [-webkit-text-stroke:1.5px_var(--color-espresso)] group-hover:text-gold group-hover:[-webkit-text-stroke:0px]" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="kicker flex items-center gap-2 text-highlight">
                      {post.category}
                      {post.type === "review" && post.flame_score != null ? <FlameBadge score={post.flame_score} /> : null}
                    </p>
                    <h3 className="mt-2 text-lg leading-snug font-bold text-balance">
                      <Link href={postHref(post)} className="after:absolute after:inset-0 group-hover:text-highlight focus-visible:underline focus-visible:outline-none">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {post.author} · {formatDate(post.published_at)}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Reels / TikTok strip */}
      <section className="border-y border-border bg-card py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading kicker="On the feed" title="Reels & TikToks" href="/portfolio" linkLabel="Full portfolio" />
        </div>
        <div className="container-site">
          <ul className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
            {reels.map((reel, i) => {
              const social = socials[i % socials.length];
              return (
                <li key={reel.id} className="w-[58vw] max-w-64 shrink-0 snap-start sm:w-56 lg:w-auto lg:max-w-none">
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-md bg-ink text-white">
                    <AspectRatio ratio={9 / 16}>
                      <Img src={reel.thumbnail} alt="" className="transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-sm bg-black/70 px-1.5 py-1 text-[0.7rem] font-bold">
                        <TikTokIcon className="size-3" /> {social.handle}
                      </span>
                      <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Play className="size-5 translate-x-px" fill="currentColor" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-3">
                        <span className="line-clamp-2 text-sm leading-snug font-bold">{reel.title}</span>
                        <span className="mt-1 block text-xs text-white/70">{reel.stats.split("·")[0]}</span>
                      </span>
                    </AspectRatio>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Latest podcast episode banner */}
      {episode ? (
        <section className="container-site py-12 lg:py-16">
          <Reveal>
            <div className="grid overflow-hidden rounded-md bg-gold text-ink md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr]">
              <div className="relative min-h-56">
                <Img src={episode.cover_image} alt="" className="absolute inset-0" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <p className="kicker">
                  Latest episode · #{pad(episode.number, 3)} · {SHOWS[episode.show].name}
                </p>
                <h2 className="mt-3 text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">{episode.title}</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/80">{episode.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <PlayButton
                    size="lg"
                    className="bg-ink text-gold"
                    track={{ id: episode.id, title: episode.title, subtitle: `${SHOWS[episode.show].name} · #${pad(episode.number, 3)}`, src: episode.audio_url, cover: episode.cover_image }}
                  />
                  <span className="text-sm font-bold">
                    Play episode · {formatDuration(episode.duration)}
                  </span>
                  <Button asChild variant="outline" size="lg" className="ml-auto h-11 border-ink bg-transparent px-5 font-bold text-ink hover:bg-ink hover:text-gold dark:border-ink dark:bg-transparent dark:hover:bg-ink">
                    <Link href="/iamtheculture/podcasts">
                      All episodes <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* Beats + commercial sounds, merch drop */}
      <section className="container-site grid gap-12 py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <SectionHeading kicker="In the studio" title="Beats & Sounds" href="/iamtheculture/music" />
          <ul className="divide-y divide-border">
            {sounds.map((t) => (
              <li key={t.id} className="flex items-center gap-4 py-4">
                <PlayButton track={{ id: t.id, title: t.title, subtitle: `${t.artist} · ${t.bpm} BPM · ${t.musical_key}`, src: t.audio_url, cover: t.cover_image }} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-bold">
                    {t.title}
                    <Badge variant="outline" className="shrink-0 text-[0.65rem] uppercase">
                      {t.kind === "cml" ? "TikTok CML" : "Beat"}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {t.bpm} BPM · {t.musical_key} · {t.genre}
                  </p>
                </div>
                <Waveform id={t.id} bars={28} className="hidden w-32 sm:flex" />
                <span className="w-14 text-right text-sm font-bold tabular-nums">{t.kind === "cml" ? "Free" : formatPrice(t.price_mp3)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Selling on TikTok Shop?{" "}
            <Link href="/iamtheculture/music?tab=cml" className="font-bold text-foreground underline underline-offset-4 hover:text-highlight">
              Browse commercial sounds cleared for shoppable videos
            </Link>
            .
          </p>
        </div>

        {drop ? (
          <div>
            <SectionHeading kicker="Latest drop" title="Merch" href="/iamtheculture/merch" linkLabel="Shop all" />
            <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
              <Link href="/iamtheculture/merch" className="group relative block overflow-hidden rounded-md bg-muted">
                <AspectRatio ratio={4 / 5}>
                  <Img src={drop.image} alt={drop.name} className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  {drop.badge ? <CategoryLabel className="absolute top-3 left-3">{drop.badge}</CategoryLabel> : null}
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
                    <span className="font-heading text-xl leading-tight font-bold">{drop.name}</span>
                    <span className="text-lg font-bold tabular-nums">{formatPrice(drop.price)}</span>
                  </span>
                </AspectRatio>
              </Link>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                {moreMerch.map((p) => (
                  <Link key={p.id} href="/iamtheculture/merch" className="group block">
                    <div className="overflow-hidden rounded-md bg-muted">
                      <AspectRatio ratio={1}>
                        <Img src={p.image} alt={p.name} className="transition-transform duration-700 group-hover:scale-105" />
                      </AspectRatio>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-bold group-hover:text-highlight">{p.name}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">{formatPrice(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Creator Corner teaser */}
      <section className="border-t border-border">
        <div className="container-site py-12 lg:py-16">
          <SectionHeading kicker="For creators" title="Creator Corner" href="/creator-corner" />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {creator.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.06}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="font-heading text-2xl font-bold">Working with a brand?</p>
              <p className="mt-1 text-sm text-muted-foreground">TikTok videos, UGC packages, podcast reads and playlist placements.</p>
            </div>
            <Button asChild size="lg" className="h-12 px-6 text-base font-bold">
              <Link href="/portfolio#inquiry">
                Start a brand inquiry <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
