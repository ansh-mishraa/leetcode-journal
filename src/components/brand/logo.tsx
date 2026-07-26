"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * KeepSolved mark — solved check cradled by a spectrum keep-arm.
 *
 * Chalk check = the solve. Open spectrum arc = spaced recall that keeps it.
 * Dot on the gap = the next review on the schedule.
 */
export function KeepSolvedMark({
  className,
  title = "KeepSolved",
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const g = `ks-g-${uid}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8 shrink-0 text-foreground", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        fill="var(--ink-raised)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* Keep-arm (~260°) — open on the right so the check can land */}
      <path
        d="M27 11.2A11 11 0 1 0 27 28.8"
        stroke={`url(#${g})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Next review on the schedule */}
      <circle cx="27" cy="11.2" r="2" fill="var(--band-master)" />

      {/* Solved */}
      <path
        d="M13.2 20.6l5 5L30.2 13.2"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        {/* Gradient follows the arm: pupil → expert → master toward the pin */}
        <linearGradient id={g} x1="8" y1="30" x2="28" y2="10">
          <stop stopColor="var(--band-pupil)" />
          <stop offset="0.5" stopColor="var(--band-expert)" />
          <stop offset="1" stopColor="var(--band-master)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function KeepSolvedLogo({
  className,
  markClassName,
  withWordmark = true,
  markOnly = false,
  size = "md",
}: {
  className?: string;
  markClassName?: string;
  withWordmark?: boolean;
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const markSize =
    size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-8";
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <KeepSolvedMark className={cn(markSize, markClassName)} />
      {!markOnly && withWordmark ? (
        <span
          className={cn("font-display leading-none tracking-tight", textSize)}
        >
          <span className="text-foreground">Keep</span>
          <span className="bg-gradient-to-r from-band-pupil via-band-expert to-band-master bg-clip-text text-transparent">
            Solved
          </span>
        </span>
      ) : null}
    </span>
  );
}
