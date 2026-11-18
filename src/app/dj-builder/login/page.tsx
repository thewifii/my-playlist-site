import { Disc3 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Private",
  robots: { index: false, follow: false },
};

export default async function DjLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/dj-builder");
  return (
    <main className="grid min-h-svh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <span className="grid size-12 place-items-center rounded-full bg-gold text-ink">
          <Disc3 className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-bold">DJ Setlist Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Private. Enter the admin password to continue.</p>
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <LoginForm scope="dj" next="/dj-builder" />
        </div>
      </div>
    </main>
  );
}
