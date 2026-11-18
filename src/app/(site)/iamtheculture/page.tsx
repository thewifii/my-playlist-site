import { ArrowUpRight, Headphones, ListMusic, Music2, Newspaper, Shirt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/media";
import { Reveal } from "@/components/motion";
import { PageHero, PostCard, SectionHeading } from "@/components/site/cards";
import { listPublished } from "@/lib/repo";
import { cultureLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Iamtheculture",
  description: "The Culture Lives Here hub: editorial and reviews, podcasts, music, merch and playlists.",
  alternates: { canonical: "/iamtheculture" },
};

const icons = [Newspaper, Headphones, Music2, Shirt, ListMusic];

export default async function CultureHubPage() {
  const [posts, episodes, tracks, products, playlists] = await Promise.all([
    listPublished("posts"),
    listPublished("episodes"),
    listPublished("tracks"),
    listPublished("products"),
    listPublished("playlists"),
  ]);
  const culture = posts.filter((p) => p.type !== "creator");
  const covers = [culture[0]?.cover_image, episodes[0]?.cover_image, tracks[0]?.cover_image, products[0]?.image, playlists[0]?.cover_image];
  const counts = [`${culture.length} stories`, `${episodes.length} episodes`, `${tracks.length} tracks`, `${products.length} products`, `${playlists.length} playlists`];

  return (
    <>
      <PageHero kicker="The hub" title="Iamtheculture" description="Everything from the Culture Lives Here network in one place. Read it, hear it, wear it." />
      <section className="container-site py-10 lg:py-14">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cultureLinks.map((link, i) => {
            const Icon = icons[i];
            return (
              <li key={link.href} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                <Reveal delay={i * 0.05}>
                  <Link href={link.href} className="group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-md bg-ink p-6 text-white lg:min-h-80">
                    <Img src={covers[i] ?? ""} alt="" className="absolute inset-0 -z-20 opacity-70 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black/10" />
                    <span className="absolute top-5 left-5 grid size-11 place-items-center rounded-full bg-gold text-ink">
                      <Icon className="size-5" />
                    </span>
                    <span className="kicker text-gold">{counts[i]}</span>
                    <span className="mt-1 flex items-center justify-between font-heading text-3xl leading-tight font-bold">
                      {link.title}
                      <ArrowUpRight className="size-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <span className="mt-2 max-w-md text-sm text-white/75">{link.description}</span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="container-site pb-16">
        <SectionHeading kicker="Culture Lives Here" title="Latest stories" href="/iamtheculture/culture-lives-here" />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {culture.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
