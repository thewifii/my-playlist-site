"use client";

import { ArrowLeft, ArrowRight, Check, Loader2, Megaphone, Mic2, ListMusic, Package, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { submitForm } from "@/components/site/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const GOALS = ["Drive TikTok Shop sales", "Launch a new product", "Build brand awareness", "Grow our social following", "Source content for paid ads", "Reach a music & culture audience"];

const DELIVERABLES = [
  { value: "TikTok video", text: "One or more videos posted to @thewifii_ or @cultureliveshere.", icon: Video },
  { value: "UGC package", text: "Raw and edited videos you run on your own channels and ads.", icon: Package },
  { value: "Podcast read", text: "A host-read spot on either podcast.", icon: Mic2 },
  { value: "Playlist placement", text: "Editorial playlist feature for artists and labels.", icon: ListMusic },
];

const TIMELINES = ["ASAP (under 2 weeks)", "2–4 weeks", "1–2 months", "Flexible / planning ahead"];
const BUDGETS = ["Under $1,000", "$1,000 – $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "$10,000+"];

const STEPS = ["Goals", "Deliverables", "Timeline & budget", "Your details"];

interface Answers {
  goals: string[];
  deliverables: string[];
  timeline: string;
  budget: string;
  brand: string;
  name: string;
  email: string;
  website: string;
  notes: string;
}

const EMPTY: Answers = { goals: [], deliverables: [], timeline: "", budget: "", brand: "", name: "", email: "", website: "", notes: "" };

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** A selectable option row with a real checkbox or radio semantics. */
function Choice({ selected, onSelect, multi, children, className }: { selected: boolean; onSelect: () => void; multi: boolean; children: React.ReactNode; className?: string }) {
  const id = React.useId();
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-4 text-sm leading-snug font-bold transition-colors hover:border-espresso has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        selected && "border-gold bg-gold/10 hover:border-gold",
        className,
      )}
    >
      {multi ? (
        <Checkbox id={id} checked={selected} onCheckedChange={onSelect} className="mt-0.5" />
      ) : (
        <>
          <input id={id} type="radio" checked={selected} onChange={onSelect} className="sr-only" />
          <span aria-hidden="true" className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-input", selected && "border-gold bg-gold")}>
            {selected ? <span className="size-1.5 rounded-full bg-ink" /> : null}
          </span>
        </>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </Label>
  );
}

export function BrandInquiry() {
  const [step, setStep] = React.useState(0);
  const [a, setA] = React.useState<Answers>(EMPTY);
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState("");
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const valid = [a.goals.length > 0, a.deliverables.length > 0, Boolean(a.timeline && a.budget), Boolean(a.brand.trim() && a.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))][step];
  const hints = ["Pick at least one goal to continue.", "Pick at least one deliverable to continue.", "Choose a timeline and a budget to continue.", "Add your brand, name and a valid email to send."];

  function go(next: number) {
    setStep(next);
    setError("");
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit() {
    setState("sending");
    setError("");
    const res = await submitForm("brand-inquiry", a.name, a.email, {
      brand: a.brand,
      website: a.website,
      goals: a.goals,
      deliverables: a.deliverables,
      timeline: a.timeline,
      budget: a.budget,
      notes: a.notes,
    });
    if (res.ok) setState("done");
    else {
      setError(res.error ?? "Something went wrong.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <Card className="border-gold/60">
        <CardContent className="py-6 text-center sm:py-10" role="status">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-gold text-ink">
            <Check className="size-8" />
          </motion.span>
          <h3 className="text-3xl font-bold">Inquiry received.</h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Thanks, {a.name.split(" ")[0]}. We&rsquo;ll reply to <span className="font-bold text-foreground">{a.email}</span> within two business days.
          </p>
          <dl className="mx-auto mt-8 grid max-w-xl gap-px overflow-hidden rounded-md border border-border bg-border text-left text-sm sm:grid-cols-2">
            {[
              ["Brand", a.brand],
              ["Deliverables", a.deliverables.join(", ")],
              ["Timeline", a.timeline],
              ["Budget", a.budget],
            ].map(([k, v]) => (
              <div key={k} className="bg-card p-4">
                <dt className="kicker text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <Button variant="outline" size="lg" className="mt-8" onClick={() => { setA(EMPTY); setStep(0); setState("idle"); }}>
            Start another inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="sm:p-4">
        {/* Progress */}
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined}>
              <span className={cn("block h-1.5 rounded-full bg-muted transition-colors", i <= step && "bg-gold")} />
              <span className={cn("kicker mt-2 hidden text-muted-foreground sm:block", i === step && "text-foreground")}>
                {i + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        <p className="kicker text-highlight sm:hidden">
          Step {step + 1} of {STEPS.length}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
            {step === 0 ? (
              <fieldset>
                <legend>
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
                    What are you trying to achieve?
                  </h3>
                  <span className="mt-1 block text-sm text-muted-foreground">Choose everything that applies.</span>
                </legend>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {GOALS.map((g) => (
                    <Choice key={g} multi selected={a.goals.includes(g)} onSelect={() => setA((p) => ({ ...p, goals: toggle(p.goals, g) }))}>
                      {g}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <fieldset>
                <legend>
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
                    Which deliverables do you need?
                  </h3>
                  <span className="mt-1 block text-sm text-muted-foreground">Mix and match. We&rsquo;ll scope the details together.</span>
                </legend>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {DELIVERABLES.map((d) => (
                    <Choice key={d.value} multi selected={a.deliverables.includes(d.value)} onSelect={() => setA((p) => ({ ...p, deliverables: toggle(p.deliverables, d.value) }))}>
                      <span className="flex items-center gap-2 text-base">
                        <d.icon className="size-4 text-highlight" /> {d.value}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{d.text}</span>
                    </Choice>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-8 md:grid-cols-2">
                <fieldset>
                  <legend>
                    <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
                      Timeline
                    </h3>
                  </legend>
                  <div className="mt-4 grid gap-2" role="radiogroup">
                    {TIMELINES.map((t) => (
                      <Choice key={t} multi={false} selected={a.timeline === t} onSelect={() => setA((p) => ({ ...p, timeline: t }))}>
                        {t}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <h3 className="text-2xl font-bold">Budget</h3>
                  </legend>
                  <div className="mt-4 grid gap-2" role="radiogroup">
                    {BUDGETS.map((b) => (
                      <Choice key={b} multi={false} selected={a.budget === b} onSelect={() => setA((p) => ({ ...p, budget: b }))}>
                        {b}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
                  Where should we reply?
                </h3>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bi-brand">Brand or company</Label>
                    <Input id="bi-brand" required autoComplete="organization" className="h-11" value={a.brand} onChange={(e) => setA((p) => ({ ...p, brand: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bi-website">Website or TikTok Shop link (optional)</Label>
                    <Input id="bi-website" type="url" inputMode="url" placeholder="https://" className="h-11" value={a.website} onChange={(e) => setA((p) => ({ ...p, website: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bi-name">Your name</Label>
                    <Input id="bi-name" required autoComplete="name" className="h-11" value={a.name} onChange={(e) => setA((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bi-email">Work email</Label>
                    <Input id="bi-email" type="email" required autoComplete="email" className="h-11" value={a.email} onChange={(e) => setA((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bi-notes">Anything else we should know? (optional)</Label>
                    <Textarea id="bi-notes" rows={4} value={a.notes} onChange={(e) => setA((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p className="mt-6 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button variant="ghost" size="lg" className="h-11" onClick={() => go(step - 1)} disabled={step === 0 || state === "sending"}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div className="flex items-center gap-4">
            {!valid ? <span className="hidden text-xs text-muted-foreground sm:inline">{hints[step]}</span> : null}
            {step < STEPS.length - 1 ? (
              <Button size="lg" className="h-11 px-6 font-bold" onClick={() => go(step + 1)} disabled={!valid}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button size="lg" className="h-11 px-6 font-bold" onClick={submit} disabled={!valid || state === "sending"}>
                {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Megaphone className="size-4" />} Send inquiry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
