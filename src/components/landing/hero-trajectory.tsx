"use client";

import { useEffect, useId, useState } from "react";

/** Cinematic full-bleed Trajectory — rating climb + dashed mastery undertone. */
export function HeroTrajectory() {
  const id = useId();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const width = 1100;
  const height = 420;
  const rating =
    "M 40 340 C 120 330, 160 300, 210 270 S 300 200, 360 210 S 460 250, 530 160 S 640 70, 720 90 S 820 120, 900 55 S 980 30, 1060 28";
  const mastery =
    "M 40 360 C 140 350, 200 320, 280 300 S 400 280, 480 250 S 600 200, 700 180 S 850 140, 1060 95";

  const dots = [
    { x: 40, y: 340, band: "var(--band-newcomer)" },
    { x: 210, y: 270, band: "var(--band-pupil)" },
    { x: 360, y: 210, band: "var(--band-specialist)" },
    { x: 530, y: 160, band: "var(--band-expert)" },
    { x: 720, y: 90, band: "var(--band-candidate-master)" },
    { x: 900, y: 55, band: "var(--band-master)" },
    { x: 1060, y: 28, band: "var(--band-grandmaster)" },
  ];

  return (
    <div className="relative w-full">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted">
            Signature visual
          </p>
          <p className="mt-1 font-display text-xl tracking-tight md:text-2xl">
            Trajectory
          </p>
        </div>
        <div className="hidden items-center gap-4 font-data text-[11px] text-muted sm:flex">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[linear-gradient(90deg,var(--band-pupil),var(--band-master))]" />
            rating
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-band-expert" />
            mastery
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full drop-shadow-[0_20px_60px_color-mix(in_srgb,var(--band-expert)_18%,transparent)]"
        role="img"
        aria-label="Animated rating trajectory climbing with a mastery retention undertone"
      >
        <defs>
          <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--band-pupil)" />
            <stop offset="40%" stopColor="var(--band-expert)" />
            <stop offset="75%" stopColor="var(--band-master)" />
            <stop offset="100%" stopColor="var(--band-grandmaster)" />
          </linearGradient>
          <linearGradient id={`${id}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--band-expert)" stopOpacity="0.28" />
            <stop offset="55%" stopColor="var(--band-master)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--band-expert)" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[80, 140, 200, 260, 320].map((y) => (
          <line
            key={y}
            x1={24}
            x2={width - 24}
            y1={y}
            y2={y}
            stroke="var(--rule)"
            strokeWidth={1}
          />
        ))}

        <path
          d={`${rating} L 1060 400 L 40 400 Z`}
          fill={`url(#${id}-fill)`}
        />

        <path
          d={mastery}
          fill="none"
          stroke="var(--band-expert)"
          strokeWidth={1.6}
          strokeDasharray="6 7"
          strokeOpacity={0.55}
          className={reduced ? undefined : "spark-draw"}
          style={{ animationDelay: "0.35s" }}
        />

        <path
          d={rating}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-glow)`}
          className={reduced ? undefined : "traj-draw"}
        />

        {dots.map((d, i) => (
          <g key={i}>
            <circle
              cx={d.x}
              cy={d.y}
              r={i === dots.length - 1 ? 7 : 4}
              fill={d.band}
              className={
                i === dots.length - 1 && !reduced ? "pulse-dot" : undefined
              }
            />
            {i === dots.length - 1 ? (
              <circle
                cx={d.x}
                cy={d.y}
                r={14}
                fill="none"
                stroke={d.band}
                strokeOpacity={0.35}
                className={reduced ? undefined : "mastery-glow"}
              />
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
