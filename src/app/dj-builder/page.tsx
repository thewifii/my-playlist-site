import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DjConsole } from "@/components/dj/dj-console";
import { getSession } from "@/lib/auth";

// Private tool: not linked from the public nav or footer, excluded from the sitemap and robots.txt,
// and gated by middleware plus this server-side check.
export const metadata: Metadata = {
  title: "DJ Setlist Builder",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DjBuilderPage() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/dj-builder/login");
  return <DjConsole />;
}
