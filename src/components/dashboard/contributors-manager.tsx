"use client";

import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface Contributor {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export function ContributorsManager({ users, admin }: { users: Contributor[]; admin: { name: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [removing, setRemoving] = React.useState<Contributor | null>(null);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    const data = ((await res?.json().catch(() => ({}))) ?? {}) as { error?: string };
    setBusy(false);
    if (!res?.ok) return setError(data.error || "Couldn't add the contributor. Try again.");
    setNotice(`${form.name} can now sign in at /login with the password you set. Share it with them privately.`);
    setForm({ name: "", email: "", password: "" });
    router.refresh();
  }

  async function onRemove() {
    if (!removing) return;
    await fetch(`/api/admin/users?id=${encodeURIComponent(removing.id)}`, { method: "DELETE" }).catch(() => null);
    setRemoving(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Contributors</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contributors can create, edit and publish content. Only the admin can delete content, manage contributors and open the DJ builder.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="size-5 text-highlight" /> Add a contributor
          </CardTitle>
          <CardDescription>Set a starting password of at least 10 characters. Passwords are stored hashed and can&rsquo;t be viewed later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required className="h-10" autoComplete="off" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" required className="h-10" autoComplete="off" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-password">Starting password</Label>
              <Input id="c-password" type="password" required minLength={10} className="h-10" autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <Button type="submit" className="h-10 gap-2 px-5 font-bold" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null} Add
            </Button>
          </form>
          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mt-3 rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-sm" role="status">
              {notice}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="kicker text-muted-foreground">Name</TableHead>
              <TableHead className="kicker text-muted-foreground">Email</TableHead>
              <TableHead className="kicker text-muted-foreground">Role</TableHead>
              <TableHead className="kicker text-muted-foreground">Added</TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <Badge>Admin</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">Signs in with ADMIN_PASSWORD</TableCell>
              <TableCell />
            </TableRow>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-bold">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">Contributor</Badge>
                </TableCell>
                <TableCell>{formatDate(u.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-lg" aria-label={`Remove ${u.name}`} onClick={() => setRemoving(u)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {users.length === 0 ? <p className="text-sm text-muted-foreground">No contributors yet. Add one above to share the workload.</p> : null}

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>They won&rsquo;t be able to sign in again. Content they created stays on the site.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep access</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onRemove}>
              Remove contributor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
