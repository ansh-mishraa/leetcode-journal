"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  BookOpen,
  Eye,
  Lightbulb,
  Loader2,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import {
  rateReviewAction,
  getDiagnoseSiblingAction,
  groqSocraticAction,
} from "@/app/actions/journal";
import { Button } from "@/components/ui/button";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
  accent: string;
}[] = [
  {
    id: "RECALL",
    label: "Recall",
    blurb: "Name the pattern from the trigger alone — no notes.",
    accent: "var(--band-pupil)",
  },
  {
    id: "REIMPLEMENT",
    label: "Re-implement",
    blurb: "Solve it cold. Open the journal only after you try.",
    accent: "var(--band-expert)",
  },
  {
    id: "DIAGNOSE",
    label: "Diagnose",
    blurb: "Same pattern, different problem — can you still spot it?",
    accent: "var(--band-master)",
  },
];

const RATINGS = [
  { value: 1, label: "Again", key: "1", tone: "text-band-grandmaster", hint: "Blank" },
  { value: 2, label: "Hard", key: "2", tone: "text-band-master", hint: "Struggled" },
  { value: 3, label: "Good", key: "3", tone: "text-band-expert", hint: "Got it" },
  { value: 4, label: "Easy", key: "4", tone: "text-band-pupil", hint: "Instant" },
] as const;

export function ReviewClient({ cards: initial }: { cards: Card[] }) {
  const total = initial.length;
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
  const done = total - cards.length;
  const activeMode = MODES.find((m) => m.id === mode)!;

  const loadDiagnose = useCallback(
    (entryId: string) => {
      setSibling(null);
      setSiblingError(null);
      start(async () => {
        const res = await getDiagnoseSiblingAction(entryId);
        if (!res.ok) {
          setSiblingError(res.error);
          return;
        }
        setSibling(res.sibling);
      });
    },
    [],
  );

  const rate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!current) return;
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
    },
    [current, mode, guess],
  );

  // Keyboard: space reveals, 1-4 grades — the loop should feel like a deck
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && /input|textarea|select/i.test(el.tagName)) return;
      if (!current) return;

      if (e.code === "Space") {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      const match = RATINGS.find((r) => r.key === e.key);
      if (match) {
        e.preventDefault();
        rate(match.value as 1 | 2 | 3 | 4);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, rate]);

  if (!current) {
    return (
      <EmptyState
        icon={total > 0 ? PartyPopper : BookOpen}
        accent={total > 0 ? "var(--band-pupil)" : "var(--band-expert)"}
        title={total > 0 ? "Queue cleared" : "Nothing due yet"}
        description={
          total > 0
            ? `You graded ${total} card${total === 1 ? "" : "s"}. New intervals are scheduled — come back when they mature.`
            : "No cards are due right now. Add another problem, or check back when intervals mature."
        }
        actions={
          <>
            <Button href="/try">Add a problem</Button>
            <Button href="/journal" variant="secondary">
              Open journal
            </Button>
          </>
        }
      />
    );
  }

  function askHint(stage: "pattern" | "approach" | "stuck") {
    setHint(null);
    start(async () => {
      const res = await groqSocraticAction({
        entryId: current.entryId,
        stage,
        userGuess: guess || undefined,
      });
      setHint(res.ok ? res.hint : res.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Session progress */}
      <div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-data uppercase tracking-wider text-muted">
            Card {done + 1} of {total}
          </span>
          <span className="font-data text-muted">
            {cards.length} left
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-sunken">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(done / total) * 100}%`,
              background:
                "linear-gradient(90deg, var(--band-pupil), var(--band-expert))",
            }}
          />
        </div>
      </div>

      {/* Mode picker */}
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => {
                setMode(m.id);
                setRevealed(false);
                setHint(null);
                if (m.id === "DIAGNOSE") loadDiagnose(current.entryId);
              }}
              className="chip"
              data-active={mode === m.id}
              style={
                mode === m.id
                  ? {
                      borderColor: `color-mix(in srgb, ${m.accent} 45%, transparent)`,
                      background: `color-mix(in srgb, ${m.accent} 12%, transparent)`,
                      color: "var(--foreground)",
                    }
                  : undefined
              }
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-sm text-muted">{activeMode.blurb}</p>
      </div>

      {/* Card */}
      <div
        key={`${current.id}-${mode}`}
        className="mode-enter glass-panel relative overflow-hidden rounded-3xl p-6 md:p-8"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          aria-hidden
          style={{
            background: `linear-gradient(90deg, transparent, ${activeMode.accent}, transparent)`,
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={difficultyTone(current.difficulty)}>
            {current.difficulty ?? "unrated"}
          </Badge>
          {current.pattern && mode !== "RECALL" ? (
            <Badge tone="expert">{current.pattern}</Badge>
          ) : null}
          <span className="font-data text-xs text-muted">{current.slug}</span>
        </div>

        <h2 className="mt-3 font-display text-2xl tracking-tight md:text-3xl">
          {mode === "DIAGNOSE" && sibling ? sibling.title : current.title}
        </h2>

        {mode === "RECALL" ? (
          <div className="mt-6 space-y-4">
            {current.trigger ? (
              <div className="rounded-2xl border border-border bg-ink-sunken px-4 py-3">
                <p className="font-data text-[10px] uppercase tracking-wider text-muted">
                  Your trigger
                </p>
                <p className="mt-1 text-sm">{current.trigger}</p>
              </div>
            ) : null}
            <div>
              <label
                htmlFor="pattern-guess"
                className="mb-1.5 block text-sm text-muted"
              >
                What pattern is this?
              </label>
              <input
                id="pattern-guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="two pointers, sliding window, monotonic stack…"
                className="field"
              />
            </div>
            {revealed ? (
              <p className="rounded-2xl bg-band-expert/10 px-4 py-3 text-sm">
                Answer:{" "}
                <span className="font-medium text-band-expert">
                  {current.pattern ?? "no pattern saved yet"}
                </span>
              </p>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRevealed(true)}
              >
                <Eye className="size-4" aria-hidden />
                Reveal answer
                <kbd className="kbd ml-1">Space</kbd>
              </Button>
            )}
          </div>
        ) : null}

        {mode === "REIMPLEMENT" ? (
          <div className="mt-6 space-y-4">
            <div
              className="prose-problem max-h-64 overflow-y-auto rounded-2xl border border-border bg-ink-sunken px-4 py-3 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  current.contentHtml ??
                  "<p>No description saved — open the journal entry.</p>",
              }}
            />
            <p className="text-sm text-muted">
              Write the solution from scratch. Ask for a nudge before you open
              your own notes.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => askHint("stuck")}
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Lightbulb className="size-4" aria-hidden />
                )}
                Socratic hint
              </Button>
              <Link
                href={`/journal/${current.entryId}`}
                className="btn btn-secondary"
              >
                <BookOpen className="size-4" aria-hidden />
                Open journal
              </Link>
            </div>
          </div>
        ) : null}

        {mode === "DIAGNOSE" ? (
          <div className="mt-6 space-y-4">
            {siblingError ? (
              <p className="rounded-2xl border border-band-master/30 bg-band-master/10 px-4 py-3 text-sm text-band-master">
                {siblingError}
              </p>
            ) : sibling ? (
              <>
                <p className="font-data text-xs text-muted">
                  {sibling.titleSlug} · same pattern family
                </p>
                <div
                  className="prose-problem max-h-56 overflow-y-auto rounded-2xl border border-border bg-ink-sunken px-4 py-3 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sibling.contentHtml ?? "" }}
                />
                <div>
                  <label
                    htmlFor="shared-pattern"
                    className="mb-1.5 block text-sm text-muted"
                  >
                    Name the shared pattern
                  </label>
                  <input
                    id="shared-pattern"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="field"
                  />
                </div>
                {revealed ? (
                  <p className="rounded-2xl bg-band-master/10 px-4 py-3 text-sm">
                    Expected:{" "}
                    <span className="font-medium text-band-master">
                      {sibling.pattern ?? current.pattern ?? "—"}
                    </span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRevealed(true)}
                  >
                    <Eye className="size-4" aria-hidden />
                    Reveal
                  </Button>
                )}
              </>
            ) : (
              <div className="skeleton h-32 w-full rounded-2xl" aria-hidden />
            )}
          </div>
        ) : null}

        {mode === "RECALL" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => askHint("pattern")}
              disabled={pending}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-3.5" aria-hidden />
              )}
              Nudge me instead
            </button>
          </div>
        ) : null}

        {hint ? (
          <p className="mt-4 rounded-2xl border border-border bg-ink-sunken px-4 py-3 text-sm leading-relaxed">
            {hint}
          </p>
        ) : null}

        {/* Grading */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 font-data text-[10px] uppercase tracking-wider text-muted">
            How did that go?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                disabled={pending}
                onClick={() => rate(r.value as 1 | 2 | 3 | 4)}
                className={cn(
                  "btn btn-secondary h-auto flex-col gap-0.5 py-3 text-sm disabled:opacity-50",
                  r.tone,
                )}
              >
                <span className="flex items-center gap-1.5">
                  {r.label}
                  <kbd className="kbd">{r.key}</kbd>
                </span>
                <span className="text-[10px] font-normal text-muted">
                  {r.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
