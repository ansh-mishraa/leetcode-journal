"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createJournalEntryAction } from "@/app/actions/journal";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = ["two-sum", "valid-parentheses", "course-schedule"];

export function NewEntryForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(value: string) {
    setError(null);
    start(async () => {
      const res = await createJournalEntryAction({ urlOrSlug: value });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/journal/${res.entryId}`);
    });
  }

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      <form
        className="flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          submit(url);
        }}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="problem-url" className="sr-only">
            LeetCode problem URL or slug
          </label>
          <input
            id="problem-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum/ or two-sum"
            className="field font-data"
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4" aria-hidden />
          )}
          {pending ? "Loading…" : "Open problem"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-data text-[10px] uppercase tracking-wider text-muted">
          Quick start
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => {
              setUrl(s);
              submit(s);
            }}
            className="chip font-data text-xs disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <p
          className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
