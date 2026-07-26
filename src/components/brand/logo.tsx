"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** KeepSolved mark — a kept check with a return arc (retention). */
export function KeepSolvedMark({
  className,
  title = "KeepSolved",
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const arcId = `ks-arc-${uid}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8 shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="40" height="40" rx="10" fill="#12151C" />
      <path
        d="M28.5 14.5c2.8 2.2 3.6 5.8 1.8 8.8"
        stroke={`url(#${arcId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M31.8 12.2l-1.2 4.2 4.1-.9"
        stroke={`url(#${arcId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 20.2l5.1 5.1L28 13.8"
        stroke="#F4F3F1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={arcId} x1="26" y1="12" x2="34" y2="24">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#3B82F6" />
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
          className={cn(
            "font-display leading-none tracking-tight",
            textSize,
          )}
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
