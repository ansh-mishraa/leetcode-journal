"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createJournalEntryAction } from "@/app/actions/journal";
import { Button } from "@/components/ui/button";

export function NewEntryForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="glass-panel flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createJournalEntryAction({ urlOrSlug: url });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          router.push(`/journal/${res.entryId}`);
        });
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
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" aria-hidden />
        )}
        {pending ? "Loading…" : "Open problem"}
      </Button>
      {error ? (
        <p className="basis-full text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
