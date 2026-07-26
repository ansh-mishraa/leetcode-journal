"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useTransition } from "react";
import {
  saveJournalEntryAction,
  groqDraftTriggersAction,
  groqSocraticAction,
} from "@/app/actions/journal";
import { Button } from "@/components/ui/button";

const NotesEditor = dynamic(
  () => import("@/components/journal/notes-editor").then((m) => m.NotesEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-border p-4 text-sm text-muted">
        Loading editor…
      </div>
    ),
  },
);

const DiagramCanvas = dynamic(
  () =>
    import("@/components/journal/diagram-canvas").then((m) => m.DiagramCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-lg border border-border text-sm text-muted">
        Loading whiteboard…
      </div>
    ),
  },
);

const SolutionEditor = dynamic(
  () =>
    import("@/components/journal/solution-editor").then((m) => m.SolutionEditor),
  { ssr: false },
);

type Entry = {
  id: string;
  approach: string | null;
  pitfalls: string | null;
  pattern: string | null;
  trigger: string | null;
  complexity: string | null;
  confidence: number | null;
  status: string;
  notes: unknown;
  solution: string | null;
  language: string | null;
  diagram: {
    elements: unknown;
    appState: unknown;
  } | null;
};

type Problem = {
  title: string;
  titleSlug: string;
  difficulty: string | null;
  contentHtml: string | null;
  topicTags: unknown;
};

export function JournalWorkspace({
  entry,
  problem,
}: {
  entry: Entry;
  problem: Problem;
}) {
  const [notes, setNotes] = useState<unknown>(entry.notes);
  const [solution, setSolution] = useState(entry.solution ?? "");
  const [language, setLanguage] = useState(entry.language ?? "typescript");
  const [approach, setApproach] = useState(entry.approach ?? "");
  const [pitfalls, setPitfalls] = useState(entry.pitfalls ?? "");
  const [pattern, setPattern] = useState(entry.pattern ?? "");
  const [trigger, setTrigger] = useState(entry.trigger ?? "");
  const [complexity, setComplexity] = useState(entry.complexity ?? "");
  const [status, setStatus] = useState(entry.status);
  const [confidence, setConfidence] = useState(entry.confidence ?? 3);
  const [elements, setElements] = useState<unknown>(
    entry.diagram?.elements ?? [],
  );
  const [appState, setAppState] = useState<unknown>(
    entry.diagram?.appState ?? {},
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = useCallback(() => {
    setMsg(null);
    start(async () => {
      const res = await saveJournalEntryAction({
        entryId: entry.id,
        notes,
        solution,
        language,
        approach,
        pitfalls,
        pattern,
        trigger,
        complexity,
        status,
        confidence,
        diagramElements: elements,
        diagramAppState: appState,
      });
      setMsg(res.ok ? "Saved" : res.error);
    });
  }, [
    entry.id,
    notes,
    solution,
    language,
    approach,
    pitfalls,
    pattern,
    trigger,
    complexity,
    status,
    confidence,
    elements,
    appState,
  ]);

  function draftTriggers() {
    setMsg(null);
    start(async () => {
      const res = await groqDraftTriggersAction(entry.id);
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      const first = res.items[0];
      if (first) {
        if (!pattern) setPattern(first.pattern);
        if (!trigger) setTrigger(first.trigger);
      }
      setMsg(
        `Drafted ${res.items.length} pattern trigger${res.items.length === 1 ? "" : "s"}`,
      );
    });
  }

  function askHint(stage: "pattern" | "approach" | "stuck") {
    setHint(null);
    start(async () => {
      const res = await groqSocraticAction({
        entryId: entry.id,
        stage,
        userGuess: pattern || approach || undefined,
      });
      if (res.ok) setHint(res.hint);
      else setHint(res.error);
    });
  }

  const tags = Array.isArray(problem.topicTags)
    ? (problem.topicTags as Array<{ name?: string }>)
        .map((t) => t.name)
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-data text-xs text-muted">{problem.titleSlug}</p>
          <h1 className="font-display text-3xl tracking-tight">
            {problem.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {problem.difficulty ? (
              <span className="rounded-full border border-border px-2 py-0.5 font-data text-xs">
                {problem.difficulty}
              </span>
            ) : null}
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 font-data text-xs text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-2 text-sm"
          >
            <option value="attempting">Attempting</option>
            <option value="solved">Solved</option>
            <option value="reviewing">Reviewing</option>
          </select>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="h-9 cursor-pointer rounded-md bg-chalk px-4 text-sm font-medium text-ink disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </header>
      {msg ? <p className="font-data text-xs text-muted">{msg}</p> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-display text-lg">Problem</h2>
          <div
            className="prose prose-invert mt-3 max-w-none text-sm"
            dangerouslySetInnerHTML={{
              __html: problem.contentHtml ?? "<p>No description available.</p>",
            }}
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={draftTriggers}
              disabled={pending}
            >
              Draft triggers (Groq)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => askHint("pattern")}
              disabled={pending}
            >
              Socratic hint
            </Button>
          </div>
          {hint ? (
            <p className="rounded-xl border border-border bg-ink-sunken px-3 py-2 text-sm leading-relaxed">
              {hint}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Trigger (what you notice first)"
              value={trigger}
              onChange={setTrigger}
            />
            <Field label="Pattern" value={pattern} onChange={setPattern} />
            <Field
              label="Complexity"
              value={complexity}
              onChange={setComplexity}
            />
            <Field label="Approach" value={approach} onChange={setApproach} />
            <Field label="Pitfalls" value={pitfalls} onChange={setPitfalls} />
          </div>
          <label className="block text-sm">
            <span className="text-muted">Confidence (1–5)</span>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </section>
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg">Notes</h2>
        <NotesEditor initial={notes} onChange={setNotes} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">Whiteboard</h2>
        <DiagramCanvas
          initialElements={elements}
          initialAppState={appState}
          onChange={(els, state) => {
            setElements(els);
            setAppState(state);
          }}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg">Solution</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 rounded-md border border-border bg-card px-2 font-data text-xs"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <SolutionEditor
          value={solution}
          language={language}
          onChange={setSolution}
        />
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-border bg-ink-sunken px-3"
      />
    </label>
  );
}
