"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const modes = [
  {
    id: "recall",
    label: "Recall",
    prompt: "Sorted array. Need a pair that sums to target.",
    answer: "Two pointers",
    color: "var(--band-pupil)",
  },
  {
    id: "reimplement",
    label: "Re-implement",
    prompt: "Solve Two Sum II cold — no notes yet.",
    answer: "Left / right → meet in the middle",
    color: "var(--band-expert)",
  },
  {
    id: "diagnose",
    label: "Diagnose",
    prompt: "New problem. Same pattern family — name it.",
    answer: "Two pointers · same trigger shape",
    color: "var(--band-master)",
  },
] as const;

export function LandingModes() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const mode = modes[idx];

  useEffect(() => {
    setRevealed(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const revealTimer = window.setTimeout(() => setRevealed(true), 1600);
    const nextTimer = window.setTimeout(() => {
      setIdx((i) => (i + 1) % modes.length);
    }, 4200);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(nextTimer);
    };
  }, [idx]);

  return (
    <section className="relative px-4 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 70% 30%, color-mix(in srgb, var(--band-expert) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted">
              Recall Engine
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">
              Graded drills, not bookmarks
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Favorites don&apos;t schedule re-solves. Three modes pressure-test
              recognition so the pattern still fires when the prompt is new.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {modes.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition",
                    i === idx
                      ? "border-transparent text-foreground"
                      : "border-border text-muted hover:text-foreground",
                  )}
                  style={
                    i === idx
                      ? {
                          background: `color-mix(in srgb, ${m.color} 18%, transparent)`,
                          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${m.color} 45%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal stagger={2}>
            <div
              key={mode.id}
              className="mode-enter glass-panel relative overflow-hidden rounded-3xl p-6 md:p-8"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${mode.color}, transparent)`,
                }}
                aria-hidden
              />
              <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
                Live drill · {mode.label}
              </p>
              <p className="mt-5 font-display text-xl leading-snug tracking-tight md:text-2xl">
                {mode.prompt}
              </p>
              <div className="mt-8 min-h-[3.5rem]">
                {revealed ? (
                  <p
                    className="rounded-2xl px-4 py-3 font-data text-sm md:text-base"
                    style={{
                      background: `color-mix(in srgb, ${mode.color} 12%, transparent)`,
                      color: mode.color,
                    }}
                  >
                    → {mode.answer}
                  </p>
                ) : (
                  <p className="font-data text-sm text-muted">
                    Thinking<span className="pulse-dot inline-block">…</span>
                  </p>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                {["Again", "Hard", "Good", "Easy"].map((r, i) => (
                  <span
                    key={r}
                    className="flex-1 rounded-xl border border-border py-2 text-center font-data text-[10px] text-muted md:text-xs"
                    style={
                      i === 2
                        ? {
                            borderColor: `color-mix(in srgb, ${mode.color} 40%, var(--rule))`,
                            color: mode.color,
                          }
                        : undefined
                    }
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
