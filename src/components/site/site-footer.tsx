import Link from "next/link";
import { NewsletterForm } from "@/components/site/forms";
import { TikTokIcon } from "@/components/site/site-header";
import { cultureLinks, site, socials } from "@/lib/site";

const exploreLinks = [
  { title: "Home", href: "/home" },
  { title: "About", href: "/about" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Creator Corner", href: "/creator-corner" },
  { title: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-site grid gap-12 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        <div>
          <p className="font-heading text-4xl leading-none font-bold tracking-tight sm:text-5xl">
            THE <span className="text-highlight">WIFII</span>
          </p>
          <p className="mt-2 font-heading text-lg font-bold tracking-tight text-muted-foreground">CULTURE LIVES HERE</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{site.tagline}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            {socials.map((s) => (
              <a
                key={s.handle}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-md border border-border bg-card px-4 text-sm font-bold transition-colors hover:border-gold hover:bg-gold hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <TikTokIcon className="size-4" />
                <span>
                  {s.handle}
                  <span className="sr-only"> on {s.platform}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explore">
          <h2 className="kicker mb-4 text-muted-foreground">Explore</h2>
          <ul className="space-y-2.5 text-sm font-bold">
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-highlight">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Iamtheculture">
          <h2 className="kicker mb-4 text-muted-foreground">Iamtheculture</h2>
          <ul className="space-y-2.5 text-sm font-bold">
            {cultureLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-highlight">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="kicker mb-4 text-muted-foreground">The Newsletter</h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">New reviews, drops, creator playbooks and playlists. One email a week, no filler.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.name} / {site.network}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="https://getsongbpm.com" target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
              Tempo data powered by GetSongBPM
            </a>
            <Link href="/login" className="hover:text-foreground">
              Contributor Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
