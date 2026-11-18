import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/site/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { spotifyPlaylistEmbed } from "@/lib/embed";
import { listPublished } from "@/lib/repo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Playlists",
  description: "Editorial playlists from Culture Lives Here, curated by tempo, key and mood. Listen here and save them to Spotify.",
  alternates: { canonical: "/iamtheculture/playlists" },
};

export default async function PlaylistsPage() {
  const playlists = await listPublished("playlists");
  return (
    <>
      <PageHero kicker="Editorial playlists" title="Sequenced, not shuffled" description="Every playlist here is built like a DJ set: ordered by tempo and key so each track hands off to the next. Press play, then save it to your library." />
      <section className="container-site py-10 lg:py-14">
        <ol className="space-y-14 lg:space-y-20">
          {playlists.map((pl, i) => (
            <li key={pl.id}>
              <Reveal>
                <article className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
                  <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                    <div className="overflow-hidden rounded-xl border border-border bg-card" style={{ height: 352 }}>
                      <iframe
                        src={spotifyPlaylistEmbed(pl.spotify_id)}
                        title={`${pl.title} on Spotify`}
                        loading="lazy"
                        className="h-full w-full border-0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="flex items-center gap-3">
                      <span className="font-heading text-5xl leading-none font-bold text-espresso tabular-nums" aria-hidden="true">
                        {pad(i + 1)}
                      </span>
                      <span className="kicker text-muted-foreground">Curated by {pl.curator}</span>
                    </p>
                    <h2 className="mt-4 text-4xl leading-none font-bold tracking-tight uppercase sm:text-5xl">{pl.title}</h2>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{pl.description}</p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Mood tags">
                      {pl.moods.map((m) => (
                        <li key={m}>
                          <Badge variant="outline" className="h-7 px-3 text-xs">
                            {m}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                    {pl.highlights.length > 0 ? (
                      <div className="mt-6">
                        <h3 className="kicker mb-2 text-muted-foreground">Track highlights</h3>
                        <ul className="divide-y divide-border border-y border-border text-sm">
                          {pl.highlights.map((h, j) => {
                            const [track, artist] = h.split(/\s[—–-]\s/);
                            return (
                              <li key={h} className="flex items-baseline gap-3 py-2.5">
                                <span className="w-5 text-xs text-muted-foreground tabular-nums">{j + 1}</span>
                                <span className="font-bold">{track}</span>
                                {artist ? <span className="ml-auto text-muted-foreground">{artist}</span> : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                    <Button asChild size="lg" className="mt-7 h-12 gap-2 px-6 text-base font-bold">
                      <a href={`https://open.spotify.com/playlist/${pl.spotify_id}`} target="_blank" rel="noopener noreferrer">
                        <Plus className="size-5" /> Save to Spotify
                      </a>
                    </Button>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
