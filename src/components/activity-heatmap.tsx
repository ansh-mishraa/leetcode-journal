"use client";

import { useMemo } from "react";

type Day = { date: string; count: number };

export function ActivityHeatmap({ days }: { days: Day[] }) {
  const { cells, max } = useMemo(() => {
    const map = new Map(days.map((d) => [d.date, d.count]));
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7 * 26);
    // align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const cells: Array<{ date: string; count: number; week: number; dow: number }> =
      [];
    const cursor = new Date(start);
    let week = 0;
    let max = 1;
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const count = map.get(key) ?? 0;
      max = Math.max(max, count);
      cells.push({ date: key, count, week, dow: cursor.getDay() });
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() === 0) week += 1;
    }
    return { cells, max };
  }, [days]);

  const weeks = Math.max(...cells.map((c) => c.week)) + 1;

  return (
    <section className="glass-panel rounded-2xl p-5 md:p-6">
      <h2 className="font-display text-lg tracking-tight">Activity</h2>
      <p className="mt-1 text-xs text-muted">Merged across platforms · last ~6 months</p>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${weeks * 12 + 20} ${7 * 12 + 8}`}
          className="h-[104px] min-w-[560px]"
          role="img"
          aria-label="Submission activity heatmap"
        >
          {cells.map((c) => {
            const intensity = c.count === 0 ? 0 : 0.2 + (c.count / max) * 0.8;
            return (
              <rect
                key={c.date}
                x={c.week * 12 + 1}
                y={c.dow * 12 + 1}
                width={10}
                height={10}
                rx={2}
                fill="var(--band-pupil)"
                opacity={intensity || 0.08}
              >
                <title>
                  {c.date}: {c.count}
                </title>
              </rect>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
