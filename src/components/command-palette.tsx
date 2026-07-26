"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command, Search } from "lucide-react";
import { searchCommandAction } from "@/app/actions/journal";
import { cn } from "@/lib/utils";

type Result = {
  type: string;
  label: string;
  href: string;
  meta?: string;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [pending, start] = useTransition();

  const runSearch = useCallback((q: string) => {
    start(async () => {
      const res = await searchCommandAction(q);
      if (res.ok) setResults([...res.results]);
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    runSearch(query);
  }, [open, query, runSearch]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground md:inline-flex"
        aria-label="Open command palette"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="ml-1 inline-flex items-center gap-0.5 rounded bg-ink-sunken px-1.5 py-0.5 font-data text-[10px]">
          <Command className="size-2.5" />K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--scrim)] px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
    >
      <div
        className="glass-panel w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl animate-float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to review, journal, or search problems…"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          {pending ? (
            <span className="font-data text-[10px] text-muted">…</span>
          ) : null}
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.map((r) => (
            <li key={`${r.href}-${r.label}`}>
              <button
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-ink-sunken",
                )}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  router.push(r.href);
                }}
              >
                <span>{r.label}</span>
                {r.meta ? (
                  <span className="font-data text-xs text-muted">{r.meta}</span>
                ) : null}
              </button>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">
              No matches
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
