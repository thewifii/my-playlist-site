import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Contributor Sign In",
  robots: { index: false, follow: false },
};

function safeNext(value: string | undefined): string {
  // Only allow same-site dashboard paths as a post-login destination.
  return value && /^\/dashboard(\/[\w\-/]*)?$/.test(value) ? value : "/dashboard";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <main className="grid min-h-svh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-heading text-3xl font-bold tracking-tight">
          THE <span className="text-highlight">WIFII</span>
        </Link>
        <p className="kicker mt-1 text-muted-foreground">Contributor sign in</p>
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <LoginForm scope="cms" next={next} />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Accounts are invite-only. Ask the admin to add you from the dashboard.{" "}
          <Link href="/home" className="font-bold text-foreground underline underline-offset-4">
            Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
