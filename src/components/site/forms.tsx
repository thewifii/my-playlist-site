"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type SubmitKind = "brand-inquiry" | "contact" | "beat-inquiry" | "newsletter" | "merch-order";

/** Posts a public form to /api/submit, which stores it in D1 (visible in the dashboard inbox). */
export async function submitForm(kind: SubmitKind, name: string, email: string, payload: Record<string, unknown> = {}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, name, email, payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await submitForm("newsletter", "", email);
    if (res.ok) setState("done");
    else {
      setError(res.error ?? "");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-md border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-bold" role="status">
        <Check className="size-4 text-highlight" /> You&rsquo;re on the list.
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email address
        </Label>
        <Input id="newsletter-email" type="email" required autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        <Button type="submit" size="lg" className="h-11 px-4 font-bold" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          <span className="sr-only sm:not-sr-only">Sign up</span>
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

const TOPICS = ["General inquiry", "Press", "Collaboration", "Podcast guest pitch", "Music licensing"];

export function ContactForm() {
  const [form, setForm] = React.useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await submitForm("contact", form.name, form.email, { topic: form.topic, message: form.message });
    if (res.ok) setState("done");
    else {
      setError(res.error ?? "");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-gold/50 bg-gold/10 p-8 text-center" role="status">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold text-ink">
          <Check className="size-6" />
        </span>
        <h3 className="text-2xl font-bold">Message sent.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Thanks, {form.name.split(" ")[0] || "friend"}. Expect a reply within two business days.</p>
        <Button variant="outline" className="mt-6" onClick={() => { setForm({ name: "", email: "", topic: TOPICS[0], message: "" }); setState("idle"); }}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" required autoComplete="name" value={form.name} onChange={set("name")} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className="h-11" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-topic">What&rsquo;s this about?</Label>
        <Select value={form.topic} onValueChange={(topic) => setForm((f) => ({ ...f, topic }))}>
          <SelectTrigger id="contact-topic" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" required rows={6} value={form.message} onChange={set("message")} />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-12 px-6 text-base font-bold" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
        Send message
      </Button>
    </form>
  );
}
