"use client";

import * as React from "react";
import { FlameSlider } from "@/components/flame-meter";

/** Interactive explainer for the rating system on the Culture Lives Here page. */
export function FlameExplainer() {
  const [score, setScore] = React.useState(3.7);
  return (
    <div className="grid gap-8 rounded-lg border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <p className="kicker text-highlight">How we score</p>
        <h2 className="mt-2 text-3xl leading-tight font-bold sm:text-4xl">The 5 Flame Burn Notice Score</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Every music, fashion and movie review gets a score from 0.0 to 5.0. The hotter the work, the bigger the flame. Anything at 4.5 or above earns a Burn Notice: drop what you&rsquo;re doing and go see it, hear it or wear it.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Drag the slider to see how the meter reacts.</p>
      </div>
      <FlameSlider value={score} onChange={setScore} label="Try the meter" />
    </div>
  );
}
