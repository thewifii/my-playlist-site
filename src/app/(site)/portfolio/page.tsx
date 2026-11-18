import type { Metadata } from "next";
import { BrandInquiry } from "@/components/site/brand-inquiry";
import { PageHero, SectionHeading } from "@/components/site/cards";
import { PortfolioShowcase } from "@/components/site/portfolio-showcase";
import { listPublished } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "TikTok Shop and UGC content, brand campaigns and viral videos by The Wifii. Start a brand inquiry.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const items = await listPublished("portfolio");
  return (
    <>
      <PageHero kicker="Portfolio" title="Work that moves" description="Shoppable TikTok content, UGC packages, brand campaigns and the videos that travelled furthest. Tap any piece to watch it." />
      <section className="container-site py-10 lg:py-14">
        <PortfolioShowcase items={items} />
      </section>
      <section id="inquiry" className="scroll-mt-20 border-t border-border bg-card">
        <div className="container-site grid gap-10 py-14 lg:grid-cols-[1fr_1.5fr] lg:py-20 xl:gap-16">
          <div>
            <SectionHeading kicker="Brand inquiry portal" title="Let's build a campaign" className="border-b-0 pb-0" />
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">Four quick questions about your goals, deliverables, timeline and budget. You&rsquo;ll get a reply within two business days.</p>
            <ul className="mt-8 space-y-3 text-sm">
              {["TikTok videos on @thewifii_ and @cultureliveshere", "UGC packages with paid usage rights", "Host-read podcast spots on two shows", "Editorial playlist placements"].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-hidden="true" /> {line}
                </li>
              ))}
            </ul>
          </div>
          <BrandInquiry />
        </div>
      </section>
    </>
  );
}
