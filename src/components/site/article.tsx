import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FlameMeter, ReaderFlameScore } from "@/components/flame-meter";
import { Embed, Img } from "@/components/media";
import { CategoryLabel, PostCard, PostMeta, SectionHeading, postHref } from "@/components/site/cards";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site";
import type { Post } from "@/lib/types";

/** Renders the simple post format: blank-line paragraphs, `## ` headings, `> ` pull quotes and `- ` lists. */
export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-[1.75] text-pretty text-foreground/90">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 text-2xl leading-tight font-bold sm:text-3xl">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-gold py-1 pl-6 font-heading text-2xl leading-snug font-medium text-foreground sm:text-3xl">
              {block.replace(/^> ?/gm, "")}
            </blockquote>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="space-y-2.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-[0.7em] size-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span>{l.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}

const REVIEW_LABEL = { music: "Music Review", fashion: "Fashion Review", movie: "Movie Review", "": "Review" } as const;

export function ArticleView({ post, related, backHref, backLabel }: { post: Post; related: Post[]; backHref: string; backLabel: string }) {
  const isReview = post.type === "review" && post.flame_score != null;
  const url = `${site.url}${postHref(post)}`;
  const jsonLd = isReview
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image,
        datePublished: post.published_at,
        url,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: site.network },
        itemReviewed: { "@type": post.review_kind === "movie" ? "Movie" : post.review_kind === "music" ? "MusicAlbum" : "Product", name: post.title },
        reviewRating: { "@type": "Rating", ratingValue: post.flame_score, bestRating: 5, worstRating: 0 },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image,
        datePublished: post.published_at,
        url,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: site.network },
      };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="container-site pt-8 pb-10 lg:pt-12">
        <Link href={backHref} className="kicker inline-flex items-center gap-2 text-muted-foreground hover:text-highlight">
          <ArrowLeft className="size-4" /> {backLabel}
        </Link>
        <div className="mt-8 max-w-5xl">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryLabel>{post.category}</CategoryLabel>
            {isReview ? <span className="kicker border border-border px-2 py-1">{REVIEW_LABEL[post.review_kind]}</span> : null}
          </div>
          <h1 className="mt-5 text-4xl leading-[1.04] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl 2xl:text-7xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-pretty text-muted-foreground">{post.excerpt}</p>
          <PostMeta post={post} className="mt-6 text-sm" />
        </div>
      </header>

      <div className="container-site">
        <div className="overflow-hidden rounded-md bg-muted">
          <AspectRatio ratio={21 / 9}>
            <Img src={post.cover_image} alt="" priority />
          </AspectRatio>
        </div>
      </div>

      <div className="container-site grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-16 xl:gap-20">
        <div className="max-w-3xl">
          {isReview ? (
            <div className="mb-10 rounded-lg border border-border bg-card p-6 sm:p-8">
              <FlameMeter score={post.flame_score ?? 0} />
            </div>
          ) : null}
          <RichText text={post.body} />

          {post.embeds.length > 0 ? (
            <section className="mt-12 space-y-6" aria-label="Media">
              <h2 className="kicker text-muted-foreground">Watch &amp; listen</h2>
              {post.embeds.map((url) => (
                <Embed key={url} url={url} />
              ))}
            </section>
          ) : null}

          {post.tags.length > 0 ? (
            <ul className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline" className="h-7 px-3 text-xs">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {isReview ? <ReaderFlameScore editorScore={post.flame_score ?? 0} /> : null}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="kicker text-muted-foreground">Written by</p>
            <p className="mt-2 font-heading text-xl font-bold">{post.author}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{site.tagline}</p>
            <Link href="/about" className="mt-4 inline-block text-sm font-bold underline underline-offset-4 hover:text-highlight">
              About The Wifii
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-border">
          <div className="container-site py-12 lg:py-16">
            <SectionHeading title="Keep reading" href={backHref} />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
