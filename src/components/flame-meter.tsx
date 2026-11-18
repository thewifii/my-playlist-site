"use client";

import { Flame } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const clamp = (n: number) => Math.min(5, Math.max(0, Number.isFinite(n) ? n : 0));

/** Colour ramps from espresso (cold) through gold to bright yellow-white (blazing). */
function heat(score: number): { color: string; glow: string } {
  const t = clamp(score) / 5;
  const stops = [
    [156, 111, 68], // espresso #9C6F44
    [245, 197, 24], // gold #F5C518
    [255, 208, 0], // bright #FFD000
  ];
  const seg = t < 0.6 ? 0 : 1;
  const local = seg === 0 ? t / 0.6 : (t - 0.6) / 0.4;
  const [a, b] = [stops[seg], stops[seg + 1]];
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  return { color: `rgb(${rgb.join(" ")})`, glow: `rgb(${rgb.join(" ")} / ${(0.15 + t * 0.6).toFixed(2)})` };
}

export function flameVerdict(score: number): string {
  const s = clamp(score);
  if (s >= 4.5) return "Burn Notice";
  if (s >= 4) return "On Fire";
  if (s >= 3) return "Heating Up";
  if (s >= 2) return "Warming Up";
  if (s >= 1) return "Lukewarm";
  return "Ice Cold";
}

/** Five small flames filled proportionally to the score. Static, safe for cards and lists. */
export function FlameRow({ score, className, size = 16 }: { score: number; className?: string; size?: number }) {
  const s = clamp(score);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${s.toFixed(1)} out of 5 flames`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, s - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Flame className="absolute inset-0 text-foreground/20" style={{ width: size, height: size }} strokeWidth={2} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Flame className="text-gold" style={{ width: size, height: size }} strokeWidth={2} fill="currentColor" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Compact score chip for cards: flame icon + number. */
export function FlameBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm bg-gold px-1.5 py-0.5 text-xs font-bold text-ink tabular-nums", className)}>
      <Flame className="size-3.5" fill="currentColor" strokeWidth={2} />
      {clamp(score).toFixed(1)}
    </span>
  );
}

/**
 * The animated 5 Flame Burn Notice meter. The flame grows, brightens and flickers
 * faster as the score climbs from 0.0 to 5.0.
 */
export function FlameMeter({ score, className, compact = false }: { score: number; className?: string; compact?: boolean }) {
  const s = clamp(score);
  const t = s / 5;
  const reduce = useReducedMotion();
  const { color, glow } = heat(s);
  const box = compact ? 96 : 148;
  const scale = 0.45 + t * 0.75;
  const flicker = reduce || s === 0 ? {} : { scaleY: [1, 1 + 0.04 + t * 0.1, 0.97, 1 + 0.02 + t * 0.07, 1], rotate: [0, -1.5 - t * 3, 1 + t * 2.5, -0.5, 0] };

  return (
    <div className={cn("flex items-center gap-5", compact && "gap-4", className)}>
      <div className="relative grid shrink-0 place-items-center" style={{ width: box, height: box }}>
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full blur-2xl"
          animate={{ width: box * (0.3 + t * 0.7), height: box * (0.3 + t * 0.7), backgroundColor: glow, opacity: reduce ? 0.6 : [0.55, 0.9, 0.6] }}
          transition={{ opacity: { duration: 1.6 - t * 0.9, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 140, damping: 18 } }}
        />
        <motion.div animate={{ scale }} transition={{ type: "spring", stiffness: 200, damping: 14 }} style={{ originY: 1 }} className="relative">
          <motion.div animate={flicker} transition={{ duration: 1.1 - t * 0.65, repeat: Infinity, ease: "easeInOut" }} style={{ originY: 1 }}>
            <Flame
              style={{ width: box * 0.78, height: box * 0.78, color, filter: `drop-shadow(0 0 ${4 + t * 22}px ${glow})` }}
              strokeWidth={1.2 + t * 1.1}
              fill="currentColor"
              fillOpacity={0.15 + t * 0.85}
            />
          </motion.div>
          {s >= 3.5 && !reduce ? (
            <motion.div className="absolute inset-0 grid place-items-center" animate={{ opacity: [0.5, 1, 0.6], y: [2, -1, 2] }} transition={{ duration: 0.7, repeat: Infinity }}>
              <Flame style={{ width: box * 0.34, height: box * 0.34, marginTop: box * 0.26 }} className="text-white" fill="currentColor" strokeWidth={0} />
            </motion.div>
          ) : null}
        </motion.div>
      </div>
      <div className="min-w-0">
        <p className="kicker text-muted-foreground">5 Flame Burn Notice Score</p>
        <p className="font-heading leading-none font-bold tabular-nums" style={{ fontSize: compact ? "2.75rem" : "4rem" }}>
          <motion.span key={s.toFixed(1)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ color }} className="inline-block">
            {s.toFixed(1)}
          </motion.span>
          <span className="text-xl font-medium text-muted-foreground"> / 5.0</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <FlameRow score={s} size={compact ? 16 : 20} />
          <span className="kicker rounded-sm border border-border px-2 py-1">{flameVerdict(s)}</span>
        </div>
      </div>
    </div>
  );
}

/** Radix Slider (0.0–5.0, step 0.1) wired to the animated meter. Used in the CMS editor and on review pages. */
export function FlameSlider({
  value,
  onChange,
  label = "Set the score",
  compact,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn("space-y-5", className)}>
      <FlameMeter score={value} compact={compact} />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <label htmlFor={id} className="font-bold uppercase tracking-wider">
            {label}
          </label>
          <span className="tabular-nums">0.0 — 5.0</span>
        </div>
        <Slider
          id={id}
          min={0}
          max={5}
          step={0.1}
          value={[clamp(value)]}
          onValueChange={([v]) => onChange(Math.round(v * 10) / 10)}
          aria-label="5 Flame Burn Notice Score"
          className="[&_[data-slot=slider-range]]:bg-gold [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gold [&_[data-slot=slider-thumb]]:bg-ink [&_[data-slot=slider-track]]:h-2"
        />
      </div>
    </div>
  );
}

/** Reader-facing slider on review pages: lets visitors try their own score next to the editor's. */
export function ReaderFlameScore({ editorScore }: { editorScore: number }) {
  const [value, setValue] = React.useState(Math.round(editorScore * 10) / 10);
  const diff = Math.round((value - editorScore) * 10) / 10;
  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h3 className="mb-4 text-lg font-bold">What&rsquo;s your score?</h3>
      <FlameSlider value={value} onChange={setValue} label="Drag to rate it yourself" compact />
      <p className="mt-4 text-sm text-muted-foreground">
        {diff === 0 ? "You match our score exactly." : `You're ${Math.abs(diff).toFixed(1)} ${diff > 0 ? "hotter" : "cooler"} than our ${editorScore.toFixed(1)}.`}
      </p>
    </div>
  );
}
