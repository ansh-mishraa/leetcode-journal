"use client";

import { useId, useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line, curveCatmullRom } from "d3-shape";
import type { MasteryPoint } from "@/server/journal/mastery";
import { cn } from "@/lib/utils";

export function MasteryCurve({
  points,
  className,
}: {
  points: MasteryPoint[];
  className?: string;
}) {
  const id = useId();
  const width = 960;
  const height = 200;
  const pad = { top: 20, right: 24, bottom: 28, left: 40 };

  const pathD = useMemo(() => {
    if (points.length < 2) return null;
    const times = points.map((p) => new Date(p.date).getTime());
    const scores = points.map((p) => p.retentionScore);
    const x = scaleTime()
      .domain([Math.min(...times), Math.max(...times)])
      .range([pad.left, width - pad.right]);
    const y = scaleLinear()
      .domain([0, 100])
      .range([height - pad.bottom, pad.top]);
    const l = line<MasteryPoint>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.retentionScore))
      .curve(curveCatmullRom.alpha(0.5));
    return { d: l(points) ?? "", color: points[points.length - 1]?.bandColor };
  }, [points]);

  if (!points.length) {
    return (
      <section className={cn("glass-panel rounded-2xl p-6", className)}>
        <h2 className="font-display text-xl tracking-tight">Mastery</h2>
        <p className="mt-2 text-sm text-muted">
          Complete reviews in the Recall Engine — this curve shows what you&apos;ll
          actually remember on interview day.
        </p>
      </section>
    );
  }

  const latest = points[points.length - 1];

  return (
    <section className={cn("glass-panel rounded-2xl p-4 md:p-6", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Mastery</h2>
          <p className="mt-0.5 text-xs text-muted">
            Retention from spaced reviews — your second Trajectory
          </p>
        </div>
        <p className="font-data text-2xl" style={{ color: latest.bandColor }} data-numeric>
          {latest.retentionScore}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Mastery retention over time">
        <defs>
          <linearGradient id={`${id}-m`} x1="0" x2="1">
            <stop offset="0%" stopColor={latest.bandColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={latest.bandColor} stopOpacity="1" />
          </linearGradient>
        </defs>
        {pathD?.d ? (
          <path
            d={pathD.d}
            fill="none"
            stroke={`url(#${id}-m)`}
            strokeWidth={2.4}
            strokeLinecap="round"
            className="traj-draw"
          />
        ) : null}
      </svg>
    </section>
  );
}
