import Link from "next/link";
import { NewsletterForm } from "@/components/site/forms";
import { TikTokIcon } from "@/components/site/site-header";
import { site, socials } from "@/lib/site";

/**
 * TEMPORARY pre-launch page. It is shown at "/" while COMING_SOON is true in src/lib/site.ts,
 * and every other public page redirects here. To launch the full site, set COMING_SOON to false.
 * This file can then be deleted along with its import in src/app/(landing)/page.tsx.
 */
export function ComingSoon() {
  const tiktok = socials[0];
  return (
    <div className="flex min-h-svh flex-col">
      <main id="main" className="relative isolate flex flex-1 items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold/15 blur-[140px]" />
        <div className="container-site py-16 text-center">
          <p className="kicker inline-flex items-center gap-2 text-highlight">
            <span className="size-2 animate-pulse rounded-full bg-gold" /> Coming soon
          </p>
          <h1 className="mt-6 font-heading leading-[0.86] font-bold tracking-tighter uppercase">
            <span className="block text-[19vw] sm:text-[15vw] xl:text-[220px]">
              The <span className="text-highlight">Wifii</span>
            </span>
            <span className="mt-3 block text-[7.2vw] tracking-tight text-foreground/90 sm:text-[5.6vw] xl:text-[84px]">Culture Lives Here</span>
          </h1>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-pretty text-muted-foreground">
            The new home for {site.name} and the {site.network} network is on the way. Leave your email and you&rsquo;ll be the first to know when it opens.
          </p>

          <div className="mx-auto mt-8 max-w-md text-left">
            <NewsletterForm />
          </div>

          <a
            href={tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-md border border-border bg-card px-5 text-sm font-bold transition-colors hover:border-gold hover:bg-gold hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <TikTokIcon className="size-4" />
            Follow me on TikTok
            <span className="text-muted-foreground">{tiktok.handle}</span>
          </a>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.name} / {site.network}
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
      </footer>
    </div>
  );
}
