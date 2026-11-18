import { ArrowUpRight, CloudOff, Database, HardDrive } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { cfEnv } from "@/lib/cf";
import { collectionKeys, collections } from "@/lib/collections";
import { dataSource, listAll, listSubmissions } from "@/lib/repo";

export default async function DashboardHome() {
  const [session, source, submissions, ...lists] = await Promise.all([getSession(), dataSource(), listSubmissions(), ...collectionKeys.map((k) => listAll(k))]);
  const r2 = Boolean(cfEnv().BUCKET);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {session?.name.split(" ")[0] ?? "there"}.</h1>
        <p className="mt-2 text-muted-foreground">Create, edit and publish everything on the site from here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={source === "d1" ? undefined : "border-gold/60"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {source === "d1" ? <Database className="size-4 text-highlight" /> : <CloudOff className="size-4 text-highlight" />}
              {source === "d1" ? "Connected to Cloudflare D1" : "Preview mode: sample data in memory"}
            </CardTitle>
            <CardDescription>
              {source === "d1"
                ? "Changes are saved to the database and appear on the live site right away."
                : "The D1 database isn't set up yet, so the site is showing built-in sample content. Edits work but reset when the server restarts. Run the schema and seed commands in the README to switch to D1."}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className={r2 ? undefined : "border-gold/60"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="size-4 text-highlight" />
              {r2 ? "File uploads: Cloudflare R2 connected" : "File uploads: R2 not connected"}
            </CardTitle>
            <CardDescription>{r2 ? "Upload cover images, merch photos and audio previews straight from any editor." : "Until the R2 bucket is bound, paste external image and audio URLs into the media fields."}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {collectionKeys.map((key, i) => {
          const items = lists[i] as { status: string }[];
          const drafts = items.filter((x) => x.status === "draft").length;
          return (
            <li key={key}>
              <Link href={`/dashboard/${key}`} className="group block h-full rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                <Card className="h-full transition-colors group-hover:border-gold">
                  <CardContent>
                    <p className="flex items-center justify-between">
                      <span className="kicker text-muted-foreground">{collections[key].label}</span>
                      <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-highlight" />
                    </p>
                    <p className="mt-3 font-heading text-5xl font-bold tabular-nums">{items.length}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {items.length - drafts} published{drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
          <CardDescription>
            {submissions.length === 0 ? "No form submissions yet. Brand inquiries, contact messages, license requests and newsletter signups land here." : `${submissions.length} submission${submissions.length === 1 ? "" : "s"} from the site's forms.`}{" "}
            <Link href="/dashboard/inbox" className="font-bold text-foreground underline underline-offset-4">
              Open inbox
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
