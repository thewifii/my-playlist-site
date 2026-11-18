import { ArrowUpRight, Handshake, Mail, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/cards";
import { ContactForm } from "@/components/site/forms";
import { TikTokIcon } from "@/components/site/site-header";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Press, general inquiries and collaborations with The Wifii and Culture Lives Here.",
  alternates: { canonical: "/contact" },
};

const channels = [
  { icon: Newspaper, title: "Press", text: "Interviews, quotes and media requests.", email: site.pressEmail },
  { icon: Mail, title: "General", text: "Questions, feedback and everything else.", email: site.email },
  { icon: Handshake, title: "Collaborations", text: "Creators, artists, podcasts and events.", email: site.bookingEmail },
];

export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Contact" title="Let's talk" description="Pick the right inbox below or send a message with the form. Brand campaigns have their own inquiry flow on the portfolio page." />
      <section className="container-site grid gap-12 py-12 lg:grid-cols-[1fr_1.2fr] lg:py-16 xl:gap-20">
        <div className="space-y-10">
          <ul className="space-y-4">
            {channels.map((c) => (
              <li key={c.title}>
                <a href={`mailto:${c.email}`} className="group flex items-start gap-4 rounded-md border border-border bg-card p-5 transition-colors hover:border-gold">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <c.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-xl font-bold">{c.title}</span>
                    <span className="block text-sm text-muted-foreground">{c.text}</span>
                    <span className="mt-1 block truncate text-sm font-bold group-hover:text-highlight">{c.email}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div>
            <h2 className="kicker mb-4 text-muted-foreground">Fastest reply: social</h2>
            <ul className="space-y-3">
              {socials.map((s) => (
                <li key={s.handle}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between border-b border-border py-3 font-heading text-2xl font-bold hover:text-highlight">
                    <span className="flex items-center gap-3">
                      <TikTokIcon className="size-5" /> {s.handle}
                    </span>
                    <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-highlight" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md bg-gold p-6 text-ink">
            <p className="font-heading text-2xl font-bold">Booking a campaign?</p>
            <p className="mt-1 text-sm text-ink/80">Tell us your goals, deliverables, timeline and budget in four quick steps.</p>
            <Link href="/portfolio#inquiry" className="mt-4 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
              Open the brand inquiry portal <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 sm:p-10">
          <h2 className="mb-6 text-3xl font-bold">Send a message</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
