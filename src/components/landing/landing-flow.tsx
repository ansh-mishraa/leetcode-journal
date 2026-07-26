"use client";

import { useEffect, useState } from "react";
import { Brain, PenLine, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: "01",
    title: "Try instantly",
    body: "Paste a LeetCode URL. Sketch the signal that points to the pattern. No account until you want to keep it.",
    icon: PenLine,
    accent: "var(--band-pupil)",
    visual: "trigger",
  },
  {
    n: "02",
    title: "Journal the why",
    body: "Notes, whiteboard, solution. Groq drafts your pattern triggers from what you already wrote.",
    icon: Brain,
    accent: "var(--band-expert)",
    visual: "journal",
  },
  {
    n: "03",
    title: "Recall on schedule",
    body: "FSRS brings it back. Grade Recall, Re-implement, or Diagnose so interview day isn’t a blank page.",
    icon: RotateCcw,
    accent: "var(--band-master)",
    visual: "recall",
  },
] as const;

function StepVisual({ kind, accent }: { kind: string; accent: string }) {
  if (kind === "trigger") {
    return (
      <svg viewBox="0 0 280 120" className="h-auto w-full" aria-hidden>
        <rect
          x="12"
          y="28"
          width="110"
          height="64"
          rx="12"
          fill="color-mix(in srgb, var(--ink-sunken) 80%, transparent)"
          stroke="var(--rule)"
        />
        <text
          x="28"
          y="56"
          className="fill-[var(--muted)]"
          style={{ fontSize: 10, fontFamily: "var(--font-data)" }}
        >
          sorted + pair
        </text>
        <text
          x="28"
          y="74"
          className="fill-[var(--foreground)]"
          style={{ fontSize: 12, fontFamily: "var(--font-display)" }}
        >
          trigger
        </text>
        <path
          d="M130 60 H168"
          stroke={accent}
          strokeWidth="2"
          strokeDasharray="4 4"
          className="spark-draw"
        />
        <polygon points="168,54 180,60 168,66" fill={accent} />
        <rect
          x="186"
          y="28"
          width="82"
          height="64"
          rx="12"
          fill={`color-mix(in srgb, ${accent} 14%, transparent)`}
          stroke={accent}
          strokeOpacity="0.45"
        />
        <text
          x="202"
          y="66"
          fill={accent}
          style={{ fontSize: 12, fontFamily: "var(--font-display)" }}
        >
          2 pointers
        </text>
      </svg>
    );
  }

  if (kind === "journal") {
    return (
      <svg viewBox="0 0 280 120" className="h-auto w-full" aria-hidden>
        <rect
          x="16"
          y="18"
          width="120"
          height="84"
          rx="10"
          fill="var(--ink-sunken)"
          stroke="var(--rule)"
        />
        {[36, 52, 68, 84].map((y, i) => (
          <rect
            key={y}
            x="28"
            y={y}
            width={i === 2 ? 70 : 96}
            height="6"
            rx="3"
            fill="var(--rule)"
          />
        ))}
        <rect
          x="150"
          y="18"
          width="114"
          height="84"
          rx="10"
          fill="var(--card)"
          stroke="var(--rule)"
        />
        <path
          d="M168 70 C180 40, 200 90, 220 50 S250 40, 248 72"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          className="spark-draw"
        />
        <circle cx="168" cy="70" r="3" fill={accent} />
        <circle cx="248" cy="72" r="3" fill={accent} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 120" className="h-auto w-full" aria-hidden>
      <rect
        x="24"
        y="24"
        width="232"
        height="72"
        rx="14"
        fill="var(--ink-sunken)"
        stroke="var(--rule)"
      />
      {["Recall", "Re-imp", "Diagnose"].map((label, i) => (
        <g key={label}>
          <rect
            x={40 + i * 72}
            y="42"
            width="60"
            height="36"
            rx="10"
            fill={
              i === 0
                ? `color-mix(in srgb, ${accent} 18%, transparent)`
                : "var(--card)"
            }
            stroke={i === 0 ? accent : "var(--rule)"}
          />
          <text
            x={70 + i * 72}
            y="64"
            textAnchor="middle"
            fill={i === 0 ? accent : "var(--muted)"}
            style={{ fontSize: 10, fontFamily: "var(--font-data)" }}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LandingFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setActive((a) => (a + 1) % steps.length);
    }, 4200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted">
            The loop
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight md:text-5xl">
            From one problem to muscle memory
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          <ol className="space-y-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = active === i;
              return (
                <li key={step.n}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "surface-interactive flex w-full cursor-pointer gap-4 rounded-2xl border px-4 py-4 text-left transition md:px-5",
                      isActive
                        ? "border-transparent bg-ink-raised shadow-[0_0_0_1px_color-mix(in_srgb,var(--chalk)_12%,transparent)]"
                        : "border-border bg-transparent hover:bg-ink-raised/50",
                    )}
                    style={
                      isActive
                        ? {
                            boxShadow: `inset 3px 0 0 ${step.accent}`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `color-mix(in srgb, ${step.accent} 16%, transparent)`,
                        color: step.accent,
                      }}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="font-data text-[10px] text-muted">
                        {step.n}
                      </span>
                      <span className="mt-0.5 block font-display text-lg tracking-tight">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">
                        {step.body}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <Reveal stagger={2} className="min-h-[280px]">
            <div
              key={active}
              className="mode-enter glass-panel relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full blur-3xl"
                style={{
                  background: `color-mix(in srgb, ${steps[active].accent} 22%, transparent)`,
                }}
                aria-hidden
              />
              <div className="relative">
                <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
                  Step {steps[active].n}
                </p>
                <p className="mt-2 font-display text-2xl tracking-tight">
                  {steps[active].title}
                </p>
              </div>
              <div className="relative mt-8">
                <StepVisual
                  kind={steps[active].visual}
                  accent={steps[active].accent}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
