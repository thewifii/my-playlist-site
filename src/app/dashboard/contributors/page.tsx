import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContributorsManager } from "@/components/dashboard/contributors-manager";
import { ADMIN_EMAIL_DEFAULT, getSession } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { listUsers } from "@/lib/repo";

export const metadata: Metadata = { title: "Contributors" };

export default async function ContributorsPage() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/dashboard");
  const users = (await listUsers()).map(({ password_hash: _hash, ...u }) => u);
  return <ContributorsManager users={users} admin={{ name: "The Wifii", email: envVar("ADMIN_EMAIL") || ADMIN_EMAIL_DEFAULT }} />;
}
