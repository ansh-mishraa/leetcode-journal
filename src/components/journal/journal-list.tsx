"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type JournalRow = {
  id: string;
  title: string;
  slug: string;
  difficulty: string | null;
  pattern: string | null;
  trigger: string | null;
  status: string;
  updatedAt: string;
  dueLabel: string | null;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "attempting", label: "Attempting" },
  { id: "solved", label: "Solved" },
  { id: "reviewing", label: "Reviewing" },
] as const;

export function JournalList({ entries }: { entries: JournalRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        (e.pattern ?? "").toLowerCase().includes(q) ||
        (e.trigger ?? "").toLowerCase().includes(q)
      );
    });
  }, [entries, query, filter]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-xs md:flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <label htmlFor="journal-search" className="sr-only">
            Search entries
          </label>
          <input
            id="journal-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, pattern, or trigger"
            className="field pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="chip"
              data-active={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          No entries match that search.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {visible.map((e, i) => (
            <li
              key={e.id}
              className="animate-float-in"
              style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
            >
              <Link
                href={`/journal/${e.id}`}
                className="surface-interactive flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{e.title}</p>
                    <Badge tone={difficultyTone(e.difficulty)}>
                      {e.difficulty ?? "unrated"}
                    </Badge>
                    {e.dueLabel ? (
                      <Badge tone="expert">
                        <Clock className="size-3" aria-hidden />
                        {e.dueLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 truncate text-sm text-muted">
                    {e.trigger ?? e.pattern ?? e.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {e.pattern ? (
                    <span className="hidden rounded-full border border-border px-2.5 py-1 font-data text-[10px] text-muted sm:inline">
                      {e.pattern}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "font-data text-[10px] uppercase tracking-wider",
                      e.status === "solved" && "text-band-pupil",
                      e.status === "reviewing" && "text-band-expert",
                      e.status === "attempting" && "text-muted",
                    )}
                  >
                    {e.status}
                  </span>
                  <time
                    className="font-data text-xs text-muted"
                    dateTime={e.updatedAt}
                  >
                    {new Date(e.updatedAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
