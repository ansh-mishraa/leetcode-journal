"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line, curveCatmullRom } from "d3-shape";
import type { TrajectoryPoint } from "@/server/aggregation";
import { cn } from "@/lib/utils";

type Props = {
  points: TrajectoryPoint[];
  bandColor: string;
  className?: string;
};

export function Trajectory({ points, bandColor, className }: Props) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [reduced, setReduced] = useState(false);
  const width = 960;
  const height = 220;
  const pad = { top: 24, right: 24, bottom: 32, left: 48 };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const rated = useMemo(
    () =>
      points
        .filter((p) => p.rating != null)
        .map((p) => ({ ...p, rating: p.rating as number })),
    [points],
  );

  const volumeByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of points) {
      if (p.volume > 0) m.set(p.date, (m.get(p.date) ?? 0) + p.volume);
    }
    return m;
  }, [points]);

  const pathD = useMemo(() => {
    if (rated.length < 2) return null;
    const times = rated.map((p) => new Date(p.date).getTime());
    const ratings = rated.map((p) => p.rating);
    const x = scaleTime()
      .domain([Math.min(...times), Math.max(...times)])
      .range([pad.left, width - pad.right]);
    const y = scaleLinear()
      .domain([Math.min(...ratings) * 0.95, Math.max(...ratings) * 1.05])
      .range([height - pad.bottom, pad.top]);

    const l = line<(typeof rated)[number]>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.rating))
      .curve(curveCatmullRom.alpha(0.5));

    return {
      d: l(rated) ?? "",
      x,
      y,
      contests: rated.filter((p) => p.contest),
    };
  }, [rated]);

  if (!rated.length) {
    return (
      <section
        className={cn(
          "glass-panel rounded-2xl p-6",
          className,
        )}
      >
        <h2 className="font-display text-xl tracking-tight">Trajectory</h2>
        <p className="mt-2 text-sm text-muted">
          Connect a contest platform (Codeforces, LeetCode contests) to plot your
          rating path.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn("glass-panel rounded-2xl p-4 md:p-6", className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={`${id}-title`} className="font-display text-xl tracking-tight">
          Trajectory
        </h2>
        <p className="font-data text-xs text-muted">
          {rated.length} contests · spectrum-tinted
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Rating trajectory over time"
      >
        <defs>
          <linearGradient id={`${id}-stroke`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={bandColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={bandColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Volume ticks along baseline */}
        {pathD &&
          [...volumeByDay.entries()].map(([date, count]) => {
            const cx = pathD.x(new Date(date));
            if (Number.isNaN(cx)) return null;
            const h = Math.min(18, 2 + count);
            return (
              <rect
                key={date}
                x={cx - 1}
                y={height - pad.bottom - h}
                width={2}
                height={h}
                fill="currentColor"
                opacity={0.12}
              />
            );
          })}

        {pathD?.d && (
          <path
            d={pathD.d}
            fill="none"
            stroke={`url(#${id}-stroke)`}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={reduced ? undefined : "traj-draw"}
          />
        )}

        {pathD?.contests.map((c) => (
          <circle
            key={`${c.date}-${c.contest}`}
            cx={pathD.x(new Date(c.date))}
            cy={pathD.y(c.rating)}
            r={3.2}
            fill="var(--chalk)"
            opacity={0.85}
          >
            <title>
              {c.contest}: {Math.round(c.rating)}
            </title>
          </circle>
        ))}
      </svg>

      {/* Accessible tabular fallback */}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">
          View as table
        </summary>
        <div className="mt-2 max-h-40 overflow-auto">
          <table className="w-full font-data text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-4">Date</th>
                <th className="py-1 pr-4">Rating</th>
                <th className="py-1">Contest</th>
              </tr>
            </thead>
            <tbody>
              {rated.map((r) => (
                <tr key={`${r.date}-${r.contest}-${r.rating}`} className="border-t border-border">
                  <td className="py-1 pr-4" data-numeric>
                    {r.date}
                  </td>
                  <td className="py-1 pr-4" data-numeric>
                    {Math.round(r.rating)}
                  </td>
                  <td className="py-1">{r.contest ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      </section>
  );
}
