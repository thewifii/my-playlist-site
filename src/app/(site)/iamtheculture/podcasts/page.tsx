import type { Metadata } from "next";
import { PodcastHub } from "@/components/site/podcast-hub";
import { listPublished } from "@/lib/repo";
import { SHOWS, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Podcasts",
  description: "Culture Lives Here Podcast and Culturally Inappropriate Podcast: two shows from the Culture Lives Here network. Listen to every episode.",
  alternates: { canonical: "/iamtheculture/podcasts" },
};

export default async function PodcastsPage() {
  const episodes = await listPublished("episodes");
  const jsonLd = Object.entries(SHOWS).map(([key, show]) => ({
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: show.name,
    description: show.tagline,
    url: `${site.url}/iamtheculture/podcasts`,
    author: { "@type": "Person", name: site.name },
    numberOfEpisodes: episodes.filter((e) => e.show === key).length,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="border-b border-border">
        <div className="container-site py-12 lg:py-16">
          <p className="kicker mb-4 text-highlight">The podcast network</p>
          <h1 className="max-w-5xl text-5xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-6xl lg:text-7xl">
            Two shows. <span className="text-highlight">Zero filler.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Pick a show, press play and keep browsing: the player follows you around the site.</p>
        </div>
      </section>
      <section className="container-site py-10 lg:py-14">
        <PodcastHub episodes={episodes} />
      </section>
    </>
  );
}
