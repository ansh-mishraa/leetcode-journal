"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  rateReviewAction,
  getDiagnoseSiblingAction,
  groqSocraticAction,
} from "@/app/actions/journal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReviewMode = "RECALL" | "REIMPLEMENT" | "DIAGNOSE";

type Card = {
  id: string;
  due: string;
  entryId: string;
  title: string;
  slug: string;
  difficulty: string | null;
  pattern: string | null;
  trigger: string | null;
  contentHtml: string | null;
};

const MODES: {
  id: ReviewMode;
  label: string;
  blurb: string;
}[] = [
  {
    id: "RECALL",
    label: "Recall",
    blurb: "Name the pattern from the trigger — no notes.",
  },
  {
    id: "REIMPLEMENT",
    label: "Re-implement",
    blurb: "Solve cold. Open the journal only after you try.",
  },
  {
    id: "DIAGNOSE",
    label: "Diagnose",
    blurb: "Same pattern, different problem — can you spot it?",
  },
];

export function ReviewClient({ cards: initial }: { cards: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [mode, setMode] = useState<ReviewMode>("RECALL");
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [sibling, setSibling] = useState<{
    title: string;
    titleSlug: string;
    contentHtml: string | null;
    pattern: string | null;
  } | null>(null);
  const [siblingError, setSiblingError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const current = cards[0];

  if (!current) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center md:p-14">
        <p className="font-display text-2xl tracking-tight">Nothing due</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Journal a problem, capture the pattern trigger, then come back —
          the Recall Engine fills as intervals mature.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/try">Try a problem</Button>
          <Button href="/journal" variant="secondary">
            Open journal
          </Button>
        </div>
      </div>
    );
  }

  function loadDiagnose() {
    setSibling(null);
    setSiblingError(null);
    start(async () => {
      const res = await getDiagnoseSiblingAction(current.entryId);
      if (!res.ok) {
        setSiblingError(res.error);
        return;
      }
      setSibling(res.sibling);
    });
  }

  function askHint(stage: "pattern" | "approach" | "stuck") {
    setHint(null);
    start(async () => {
      const res = await groqSocraticAction({
        entryId: current.entryId,
        stage,
        userGuess: guess || undefined,
      });
      if (res.ok) setHint(res.hint);
      else setHint(res.error);
    });
  }

  function rate(rating: 1 | 2 | 3 | 4) {
    start(async () => {
      await rateReviewAction({
        cardId: current.id,
        rating,
        mode,
        recalledPattern: guess.trim() || undefined,
      });
      setCards((c) => c.slice(1));
      setRevealed(false);
      setGuess("");
      setHint(null);
      setSibling(null);
      setSiblingError(null);
    });
  }

  return (
    <div className="mx-auto max-w-2xl animate-float-in space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              setRevealed(false);
              setHint(null);
              if (m.id === "DIAGNOSE") loadDiagnose();
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition",
              mode === m.id
                ? "border-band-expert/50 bg-band-expert/10 text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">
        {MODES.find((m) => m.id === mode)?.blurb}
      </p>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <p className="font-data text-xs text-muted">{current.slug}</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
          {mode === "DIAGNOSE" && sibling ? sibling.title : current.title}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {current.difficulty ?? "?"}
          {mode !== "DIAGNOSE" && current.trigger
            ? ` · Trigger: ${current.trigger}`
            : ""}
        </p>

        {mode === "RECALL" ? (
          <div className="mt-6 space-y-3">
            <label className="block text-sm">
              <span className="text-muted">What pattern is this?</span>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="e.g. two pointers, sliding window…"
                className="mt-1 h-11 w-full rounded-xl border border-border bg-ink-sunken px-3"
              />
            </label>
            {!revealed ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRevealed(true)}
              >
                Reveal answer
              </Button>
            ) : (
              <p className="rounded-xl bg-ink-sunken px-3 py-2 text-sm">
                Pattern:{" "}
                <span className="font-medium">
                  {current.pattern ?? "not set yet"}
                </span>
              </p>
            )}
          </div>
        ) : null}

        {mode === "REIMPLEMENT" ? (
          <div className="mt-6 space-y-3">
            {!revealed ? (
              <>
                <div
                  className="prose prose-invert max-h-64 max-w-none overflow-y-auto text-sm"
                  dangerouslySetInnerHTML={{
                    __html:
                      current.contentHtml ??
                      "<p>Open the journal if description is missing.</p>",
                  }}
                />
                <p className="text-sm text-muted">
                  Solve from scratch. When stuck, ask a Socratic hint — or open
                  your notes after you try.
                </p>
              </>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => askHint("stuck")}
                disabled={pending}
              >
                Socratic hint
              </Button>
              <Link
                href={`/journal/${current.entryId}`}
                className="btn btn-secondary h-10 px-4 text-sm"
              >
                Open journal
              </Link>
            </div>
            {hint ? (
              <p className="rounded-xl border border-border bg-ink-sunken px-3 py-2 text-sm leading-relaxed">
                {hint}
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === "DIAGNOSE" ? (
          <div className="mt-6 space-y-3">
            {siblingError ? (
              <p className="text-sm text-band-master">{siblingError}</p>
            ) : null}
            {sibling ? (
              <>
                <p className="font-data text-xs text-muted">
                  {sibling.titleSlug} · same pattern family
                </p>
                <div
                  className="prose prose-invert max-h-56 max-w-none overflow-y-auto text-sm"
                  dangerouslySetInnerHTML={{
                    __html: sibling.contentHtml ?? "",
                  }}
                />
                <label className="block text-sm">
                  <span className="text-muted">Name the shared pattern</span>
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-ink-sunken px-3"
                  />
                </label>
                {!revealed ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRevealed(true)}
                  >
                    Reveal
                  </Button>
                ) : (
                  <p className="text-sm">
                    Expected:{" "}
                    <span className="font-medium">
                      {sibling.pattern ?? current.pattern ?? "—"}
                    </span>
                  </p>
                )}
              </>
            ) : !siblingError ? (
              <p className="text-sm text-muted">Loading sibling problem…</p>
            ) : null}
          </div>
        ) : null}

        {mode === "RECALL" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => askHint("pattern")}
              disabled={pending}
            >
              Hint (Socratic)
            </Button>
            {hint ? (
              <p className="w-full rounded-xl bg-ink-sunken px-3 py-2 text-sm">
                {hint}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              [1, "Again", "text-band-grandmaster"],
              [2, "Hard", "text-band-master"],
              [3, "Good", "text-band-expert"],
              [4, "Easy", "text-band-pupil"],
            ] as const
          ).map(([r, label, tone]) => (
            <button
              key={r}
              type="button"
              disabled={pending}
              onClick={() => rate(r)}
              className={`btn btn-secondary h-12 flex-col gap-0 py-2 text-sm disabled:opacity-50 ${tone}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-4 font-data text-xs text-muted">
          {cards.length} remaining · mode {mode.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
