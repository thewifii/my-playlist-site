import type { Metadata } from "next";
import Link from "next/link";
import { OverlayCard, PageHero, PostCard } from "@/components/site/cards";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { listPublished } from "@/lib/repo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Creator Corner",
  description: "Content creator tips, TikTok Shop strategies, monetization breakdowns and gear and workflow guides from The Wifii.",
  alternates: { canonical: "/creator-corner" },
};

const PAGE_SIZE = 6;

export default async function CreatorCornerPage({ searchParams }: { searchParams: Promise<{ category?: string; format?: string; page?: string }> }) {
  const params = await searchParams;
  const all = (await listPublished("posts")).filter((p) => p.type === "creator");
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const category = categories.find((c) => c === params.category) ?? "";
  const format = params.format === "vlog" || params.format === "blog" ? params.format : "";

  const filtered = all.filter((p) => (!category || p.category === category) && (!format || p.format === format));
  const unfiltered = !category && !format;
  const featured = unfiltered ? (filtered.find((p) => p.featured) ?? filtered[0]) : undefined;
  const list = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const href = (next: { category?: string; format?: string; page?: number }) => {
    const q = new URLSearchParams();
    const c = next.category ?? category;
    const f = next.format ?? format;
    if (c) q.set("category", c);
    if (f) q.set("format", f);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const s = q.toString();
    return s ? `/creator-corner?${s}` : "/creator-corner";
  };

  const pill = (active: boolean) =>
    cn("kicker inline-flex h-9 items-center rounded-full border border-border px-4 whitespace-nowrap transition-colors hover:border-gold", active && "border-gold bg-gold text-ink");

  return (
    <>
      <PageHero kicker="Creator Corner" title="The playbook, in public" description="What's working right now: content tips, TikTok Shop strategy, monetization breakdowns and the gear and workflow behind the videos." />

      <section className="container-site py-10 lg:py-14">
        <nav aria-label="Filter posts" className="mb-10 space-y-3">
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <li>
              <Link href={href({ category: "", page: 1 })} className={pill(!category)} aria-current={!category ? "true" : undefined}>
                All topics
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link href={href({ category: c, page: 1 })} className={pill(category === c)} aria-current={category === c ? "true" : undefined}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex gap-2">
            {[
              { value: "", label: "Blog + Vlog" },
              { value: "blog", label: "Blog" },
              { value: "vlog", label: "Vlog" },
            ].map((f) => (
              <li key={f.label}>
                <Link href={href({ format: f.value, page: 1 })} className={cn("text-sm font-bold text-muted-foreground underline-offset-4 hover:text-foreground", format === f.value && "text-foreground underline decoration-gold decoration-2")}>
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {featured && page === 1 ? <OverlayCard post={featured} priority className="mb-12 min-h-[420px] lg:min-h-[520px]" /> : null}

        {visible.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
            No posts match these filters yet.{" "}
            <Link href="/creator-corner" className="font-bold text-foreground underline underline-offset-4">
              Clear filters
            </Link>
          </p>
        )}

        {pages > 1 ? (
          <Pagination className="mt-14">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href={href({ page: Math.max(1, page - 1) })} aria-disabled={page === 1} className={cn(page === 1 && "pointer-events-none opacity-40")} />
              </PaginationItem>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink href={href({ page: n })} isActive={n === page}>
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href={href({ page: Math.min(pages, page + 1) })} aria-disabled={page === pages} className={cn(page === pages && "pointer-events-none opacity-40")} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </section>
    </>
  );
}
