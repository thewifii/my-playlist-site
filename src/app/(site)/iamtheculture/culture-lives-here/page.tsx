import type { Metadata } from "next";
import Link from "next/link";
import { FlameRow } from "@/components/flame-meter";
import { Embed } from "@/components/media";
import { CompactCard, OverlayCard, PostCard, SectionHeading, postHref } from "@/components/site/cards";
import { FlameExplainer } from "@/components/site/flame-explainer";
import { listPublished } from "@/lib/repo";
import { cn, pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Culture Lives Here — Editorial & Reviews",
  description: "Music, fashion and film reviews scored with the 5 Flame Burn Notice Score, plus essays on culture and the creator economy.",
  alternates: { canonical: "/iamtheculture/culture-lives-here" },
};

export default async function CultureLivesHerePage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section: rawSection } = await searchParams;
  const all = (await listPublished("posts")).filter((p) => p.type !== "creator");
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const section = rawSection === "reviews" || categories.includes(rawSection ?? "") ? (rawSection as string) : "";

  const filtered = !section ? all : section === "reviews" ? all.filter((p) => p.type === "review") : all.filter((p) => p.category === section);
  const lead = filtered.find((p) => p.featured) ?? filtered[0];
  const secondary = filtered.filter((p) => p.id !== lead?.id).slice(0, 4);
  const rest = filtered.filter((p) => p.id !== lead?.id).slice(4);
  const board = all.filter((p) => p.type === "review" && p.flame_score != null).sort((a, b) => (b.flame_score ?? 0) - (a.flame_score ?? 0)).slice(0, 6);
  const mediaPost = all.find((p) => p.format === "vlog" && p.embeds.length > 0);

  const tabs = [{ value: "", label: "All" }, { value: "reviews", label: "5 Flame Reviews" }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <>
      {/* Masthead */}
      <section className="border-b-4 border-foreground">
        <div className="container-site pt-10 pb-6 lg:pt-14">
          <p className="kicker text-highlight">Editorial media &amp; reviews</p>
          <h1 className="mt-3 font-heading text-[13vw] leading-[0.85] font-bold tracking-tighter uppercase lg:text-[9.5vw] 2xl:text-[160px]">
            Culture <span className="text-highlight">Lives</span> Here
          </h1>
        </div>
        <nav aria-label="Sections" className="container-site">
          <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {tabs.map((t) => {
              const active = section === t.value;
              return (
                <li key={t.label}>
                  <Link
                    href={t.value ? `/iamtheculture/culture-lives-here?section=${encodeURIComponent(t.value)}` : "/iamtheculture/culture-lives-here"}
                    aria-current={active ? "page" : undefined}
                    className={cn("kicker inline-flex h-11 items-center px-4 whitespace-nowrap transition-colors hover:bg-muted", active && "bg-foreground text-background hover:bg-foreground")}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>

      {/* Magazine lead */}
      <section className="container-site py-8 lg:py-10">
        {lead ? (
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <OverlayCard post={lead} priority className="min-h-[440px] lg:min-h-[600px]" />
            <div className="flex flex-col divide-y divide-border">
              {secondary.map((post) => (
                <CompactCard key={post.id} post={post} className="py-5 first:pt-0 last:pb-0" />
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">Nothing published in this section yet.</p>
        )}
      </section>

      {/* Burn Notice board */}
      {!section || section === "reviews" ? (
        <section className="border-y border-border bg-card">
          <div className="container-site py-12 lg:py-16">
            <SectionHeading kicker="Ranked by score" title="The Burn Notice Board" href="/iamtheculture/culture-lives-here?section=reviews" linkLabel="All reviews" />
            <ol className="grid gap-x-10 md:grid-cols-2">
              {board.map((post, i) => (
                <li key={post.id} className="group relative flex items-center gap-5 border-b border-border py-5">
                  <span className="w-12 font-heading text-4xl font-bold text-espresso tabular-nums" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="kicker text-muted-foreground">
                      {post.review_kind} review
                    </p>
                    <h3 className="mt-1 line-clamp-2 leading-snug font-bold">
                      <Link href={postHref(post)} className="after:absolute after:inset-0 group-hover:text-highlight focus-visible:underline focus-visible:outline-none">
                        {post.title}
                      </Link>
                    </h3>
                    <FlameRow score={post.flame_score ?? 0} className="mt-2" />
                  </div>
                  <span className="font-heading text-4xl font-bold text-highlight tabular-nums">{(post.flame_score ?? 0).toFixed(1)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-12">
              <FlameExplainer />
            </div>
          </div>
        </section>
      ) : null}

      {/* More stories */}
      {rest.length > 0 ? (
        <section className="container-site py-12 lg:py-16">
          <SectionHeading title="More stories" />
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Rich media feature */}
      {mediaPost && !section ? (
        <section className="border-t border-border">
          <div className="container-site grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-16">
            <Embed url={mediaPost.embeds[0]} title={mediaPost.title} />
            <div>
              <p className="kicker text-highlight">Watch</p>
              <h2 className="mt-2 text-3xl leading-tight font-bold text-balance sm:text-4xl">{mediaPost.title}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{mediaPost.excerpt}</p>
              <Link href={postHref(mediaPost)} className="mt-5 inline-block font-bold underline underline-offset-4 hover:text-highlight">
                Read the full piece
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
