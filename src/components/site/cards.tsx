import { ArrowUpRight, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { FlameBadge } from "@/components/flame-meter";
import { Img } from "@/components/media";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Post } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function postHref(post: Pick<Post, "type" | "slug">): string {
  return post.type === "creator" ? `/creator-corner/${post.slug}` : `/iamtheculture/culture-lives-here/${post.slug}`;
}

export function CategoryLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("kicker inline-block bg-gold px-2 py-1 text-ink", className)}>{children}</span>;
}

export function PostMeta({ post, className }: { post: Post; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      <span className="font-bold text-foreground/80">{post.author}</span>
      <span>{formatDate(post.published_at)}</span>
      {post.read_time ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" /> {post.read_time} min {post.format === "vlog" ? "watch" : "read"}
        </span>
      ) : null}
    </p>
  );
}

function CoverBadges({ post }: { post: Post }) {
  return (
    <div className="absolute top-3 left-3 flex items-center gap-2">
      <CategoryLabel>{post.category}</CategoryLabel>
      {post.flame_score != null && post.type === "review" ? <FlameBadge score={post.flame_score} /> : null}
      {post.format === "vlog" ? (
        <span className="inline-flex items-center gap-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-xs font-bold text-white">
          <PlayCircle className="size-3.5" /> Vlog
        </span>
      ) : null}
    </div>
  );
}

/** Standard editorial card: image on top, headline below. */
export function PostCard({ post, ratio = 16 / 10, className, priority }: { post: Post; ratio?: number; className?: string; priority?: boolean }) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-md bg-muted">
        <AspectRatio ratio={ratio}>
          <Img src={post.cover_image} alt="" priority={priority} className="transition-transform duration-500 group-hover:scale-105" />
        </AspectRatio>
        <CoverBadges post={post} />
      </div>
      <h3 className="mt-4 text-xl leading-snug font-bold text-balance">
        <Link href={postHref(post)} className="after:absolute after:inset-0 group-hover:text-highlight focus-visible:outline-none focus-visible:underline">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <PostMeta post={post} className="mt-3" />
    </article>
  );
}

/** Large image card with the headline over a dark gradient. Used for hero and featured stories. */
export function OverlayCard({ post, className, size = "lg", priority }: { post: Post; className?: string; size?: "lg" | "sm"; priority?: boolean }) {
  return (
    <article className={cn("group relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-md bg-ink text-white", className)}>
      <Img src={post.cover_image} alt="" priority={priority} className="absolute inset-0 -z-20 transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/5" />
      <CoverBadges post={post} />
      <div className={cn("p-5", size === "lg" && "sm:p-8 lg:p-10")}>
        <h3 className={cn("font-bold text-balance", size === "lg" ? "text-3xl leading-[1.08] sm:text-4xl lg:text-5xl 2xl:text-6xl" : "text-xl leading-snug")}>
          <Link href={postHref(post)} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:underline group-hover:text-gold">
            {post.title}
          </Link>
        </h3>
        {size === "lg" ? <p className="mt-4 line-clamp-2 max-w-2xl text-base text-white/80 sm:text-lg">{post.excerpt}</p> : null}
        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-white/70">
          <span className="font-bold text-white">{post.author}</span>
          <span>{formatDate(post.published_at)}</span>
          {post.read_time ? <span>{post.read_time} min</span> : null}
        </p>
      </div>
    </article>
  );
}

/** Small horizontal card: thumbnail left, headline right. */
export function CompactCard({ post, className }: { post: Post; className?: string }) {
  return (
    <article className={cn("group relative flex gap-4", className)}>
      <div className="w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-36">
        <AspectRatio ratio={4 / 3}>
          <Img src={post.cover_image} alt="" className="transition-transform duration-500 group-hover:scale-105" />
        </AspectRatio>
      </div>
      <div className="min-w-0">
        <p className="kicker flex items-center gap-2 text-highlight">
          {post.category}
          {post.flame_score != null && post.type === "review" ? <FlameBadge score={post.flame_score} /> : null}
        </p>
        <h3 className="mt-1.5 line-clamp-3 text-base leading-snug font-bold">
          <Link href={postHref(post)} className="after:absolute after:inset-0 group-hover:text-highlight focus-visible:outline-none focus-visible:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
      </div>
    </article>
  );
}

export function SectionHeading({
  kicker,
  title,
  href,
  linkLabel = "View all",
  className,
}: {
  kicker?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4 border-b-2 border-foreground pb-4", className)}>
      <div>
        {kicker ? <p className="kicker mb-2 text-highlight">{kicker}</p> : null}
        <h2 className="text-3xl leading-none font-bold tracking-tight uppercase sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="kicker inline-flex shrink-0 items-center gap-1 pb-1 hover:text-highlight">
          {linkLabel} <ArrowUpRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function PageHero({ kicker, title, description, children }: { kicker: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-border">
      <div className="container-site py-12 sm:py-16 lg:py-20">
        <p className="kicker mb-4 text-highlight">{kicker}</p>
        <h1 className="max-w-5xl text-5xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-6xl lg:text-7xl 2xl:text-8xl">{title}</h1>
        {description ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}
