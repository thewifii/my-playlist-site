import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { listSubmissions } from "@/lib/repo";
import type { Submission } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Inbox" };

const LABELS: Record<Submission["kind"], string> = {
  "brand-inquiry": "Brand inquiry",
  contact: "Contact",
  "beat-inquiry": "License request",
  newsletter: "Newsletter signup",
  "merch-order": "Merch order request",
};

function show(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => (typeof v === "object" && v ? Object.values(v).join(" · ") : String(v))).join("; ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

export default async function InboxPage() {
  const submissions = await listSubmissions();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything sent through the site&rsquo;s forms: brand inquiries, contact messages, license and merch requests, and newsletter signups.</p>

      {submissions.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">Nothing yet. New submissions show up here as soon as they&rsquo;re sent.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{LABELS[s.kind] ?? s.kind}</Badge>
                  {s.name ? <span className="font-bold">{s.name}</span> : null}
                  <a href={`mailto:${s.email}`} className="text-sm underline underline-offset-4 hover:text-highlight">
                    {s.email}
                  </a>
                </div>
                <time className="text-xs text-muted-foreground" dateTime={s.created_at}>
                  {formatDate(s.created_at)}
                </time>
              </div>
              {Object.keys(s.payload).length > 0 ? (
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
                  {Object.entries(s.payload)
                    .filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0))
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="kicker pt-0.5 text-muted-foreground">{k}</dt>
                        <dd className="break-words whitespace-pre-wrap">{show(v)}</dd>
                      </div>
                    ))}
                </dl>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
