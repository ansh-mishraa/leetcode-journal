"use client";

import { useId, useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line, area, curveCatmullRom } from "d3-shape";
import { TrendingUp } from "lucide-react";
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
  const pad = { top: 22, right: 20, bottom: 26, left: 20 };

  const shapes = useMemo(() => {
    if (points.length < 2) return null;
    const times = points.map((p) => new Date(p.date).getTime());
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

    const a = area<MasteryPoint>()
      .x((d) => x(new Date(d.date)))
      .y0(height - pad.bottom)
      .y1((d) => y(d.retentionScore))
      .curve(curveCatmullRom.alpha(0.5));

    return { line: l(points) ?? "", area: a(points) ?? "" };
  }, [points]);

  if (points.length < 2) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-border px-5 py-6",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-band-expert/12 text-band-expert">
            <TrendingUp className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg tracking-tight">Mastery curve</h2>
            <p className="mt-1 text-sm text-muted">
              Grade a few reviews and this plots what you&apos;ll actually
              remember — your second Trajectory.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const latest = points[points.length - 1];
  const first = points[0];
  const delta = latest.retentionScore - first.retentionScore;

  return (
    <section className={cn("glass-panel rounded-2xl p-4 md:p-6", className)}>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg tracking-tight">Mastery curve</h2>
          <p className="mt-0.5 text-xs text-muted">
            Retention from spaced reviews · {points.length} sessions
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-data text-3xl leading-none"
            style={{ color: latest.bandColor }}
            data-numeric
          >
            {latest.retentionScore}
          </p>
          <p
            className={cn(
              "mt-1 font-data text-xs",
              delta >= 0 ? "text-band-pupil" : "text-band-master",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta} since start
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Mastery retention over time, currently ${latest.retentionScore} out of 100`}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={latest.bandColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={latest.bandColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[25, 50, 75].map((v) => (
          <line
            key={v}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + ((100 - v) / 100) * (height - pad.top - pad.bottom)}
            y2={pad.top + ((100 - v) / 100) * (height - pad.top - pad.bottom)}
            stroke="var(--rule)"
            strokeWidth={1}
          />
        ))}

        {shapes ? (
          <>
            <path d={shapes.area} fill={`url(#${id}-fill)`} />
            <path
              d={shapes.line}
              fill="none"
              stroke={latest.bandColor}
              strokeWidth={2.6}
              strokeLinecap="round"
              className="traj-draw"
            />
          </>
        ) : null}
      </svg>
    </section>
  );
}
