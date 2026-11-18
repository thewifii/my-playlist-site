import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { MusicHub } from "@/components/site/music-hub";
import { CML_FAQ } from "@/lib/cml-faq";
import { listPublished } from "@/lib/repo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Music — Beats, Reference Tracks & Commercial Sounds for TikTok Shop Creators",
  description:
    "Beats and reference tracks for sale by The Wifii, plus a free directory of commercial sounds for TikTok Shop creators from the TikTok Commercial Music Library (CML). Preview every track and open it on TikTok in one tap.",
  keywords: ["commercial sounds for TikTok Shop creators", "TikTok Commercial Music Library", "TikTok CML sounds", "TikTok Shop music", "beats for sale", "reference tracks"],
  alternates: { canonical: "/iamtheculture/music" },
};

export default async function MusicPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tracks = await listPublished("tracks");
  const cml = tracks.filter((t) => t.kind === "cml");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Commercial Sounds for TikTok Shop Creators",
      description: "Tracks by The Wifii available in the TikTok Commercial Music Library.",
      url: `${site.url}/iamtheculture/music?tab=cml`,
      numberOfItems: cml.length,
      itemListElement: cml.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "MusicRecording",
          name: t.title,
          byArtist: { "@type": "MusicGroup", name: t.artist },
          genre: t.genre,
          duration: `PT${Math.floor(t.duration / 60)}M${t.duration % 60}S`,
          description: t.description,
          url: t.tiktok_url || undefined,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: CML_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero kicker="Music" title="Beats, demos & sounds" description="Three catalogs: beats for artists, full reference tracks for labels and writers, and commercially cleared sounds for TikTok Shop creators. Everything previews instantly." />
      <section className="container-site py-10 lg:py-14">
        <MusicHub tracks={tracks} initialTab={tab} />
      </section>
    </>
  );
}
