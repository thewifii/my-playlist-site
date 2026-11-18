"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Sign-in form. `scope="dj"` shows the password-only gate for the DJ builder. */
export function LoginForm({ scope, next }: { scope: "cms" | "dj"; next: string }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, scope }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Couldn't sign in. Try again.");
        setBusy(false);
        return;
      }
      window.location.assign(next);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {scope === "cms" ? (
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" required autoComplete="username" autoFocus className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" required autoComplete="current-password" autoFocus={scope === "dj"} className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-12 w-full gap-2 text-base font-bold" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />} Sign in
      </Button>
    </form>
  );
}
