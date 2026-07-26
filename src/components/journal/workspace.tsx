"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Check,
  Code2,
  FileText,
  Lightbulb,
  Loader2,
  PenTool,
  Sparkles,
  Target,
} from "lucide-react";
import {
  saveJournalEntryAction,
  groqDraftTriggersAction,
  groqSocraticAction,
} from "@/app/actions/journal";
import { Button } from "@/components/ui/button";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NotesEditor = dynamic(
  () => import("@/components/journal/notes-editor").then((m) => m.NotesEditor),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 w-full rounded-2xl" />,
  },
);

const DiagramCanvas = dynamic(
  () =>
    import("@/components/journal/diagram-canvas").then((m) => m.DiagramCanvas),
  {
    ssr: false,
    loading: () => <div className="skeleton h-[420px] w-full rounded-2xl" />,
  },
);

const SolutionEditor = dynamic(
  () =>
    import("@/components/journal/solution-editor").then((m) => m.SolutionEditor),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 w-full rounded-2xl" />,
  },
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
  diagram: { elements: unknown; appState: unknown } | null;
};

type Problem = {
  title: string;
  titleSlug: string;
  difficulty: string | null;
  contentHtml: string | null;
  topicTags: unknown;
};

const TABS = [
  { id: "recall", label: "Recall card", icon: Target },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "board", label: "Whiteboard", icon: PenTool },
  { id: "code", label: "Solution", icon: Code2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function JournalWorkspace({
  entry,
  problem,
}: {
  entry: Entry;
  problem: Problem;
}) {
  const [tab, setTab] = useState<TabId>("recall");
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
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setDirty(true);
  }, [
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
      if (res.ok) {
        setDirty(false);
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setMsg(res.error);
      }
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

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

  function askHint() {
    setHint(null);
    start(async () => {
      const res = await groqSocraticAction({
        entryId: entry.id,
        stage: "pattern",
        userGuess: pattern || approach || undefined,
      });
      setHint(res.ok ? res.hint : res.error);
    });
  }

  const tags = Array.isArray(problem.topicTags)
    ? (problem.topicTags as Array<{ name?: string }>)
        .map((t) => t.name)
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-5">
      {/* Sticky action bar */}
      <header className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-0 md:rounded-2xl md:border md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-xl tracking-tight md:text-2xl">
                {problem.title}
              </h1>
              <Badge tone={difficultyTone(problem.difficulty)}>
                {problem.difficulty ?? "unrated"}
              </Badge>
            </div>
            <p className="mt-0.5 font-data text-xs text-muted">
              {problem.titleSlug}
              {savedAt && !dirty ? ` · saved ${savedAt}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="entry-status" className="sr-only">
              Entry status
            </label>
            <select
              id="entry-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 cursor-pointer rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="attempting">Attempting</option>
              <option value="solved">Solved</option>
              <option value="reviewing">Reviewing</option>
            </select>
            <Button type="button" onClick={save} disabled={pending || !dirty}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : dirty ? null : (
                <Check className="size-4" aria-hidden />
              )}
              {pending ? "Saving…" : dirty ? "Save" : "Saved"}
              {dirty ? <kbd className="kbd ml-1">⌘S</kbd> : null}
            </Button>
          </div>
        </div>
        {msg ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {msg}
          </p>
        ) : null}
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Problem statement */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3.5">
            <h2 className="font-display text-base tracking-tight">Problem</h2>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2 py-0.5 font-data text-[10px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div
            className="prose-problem max-h-[70vh] overflow-y-auto px-5 py-4 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: problem.contentHtml ?? "<p>No description available.</p>",
            }}
          />
        </section>

        {/* Work surface */}
        <section className="rounded-2xl border border-border bg-card">
          <div
            className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2"
            role="tablist"
            aria-label="Workspace"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition",
                    isActive
                      ? "bg-ink-sunken text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-4", isActive && "text-band-expert")}
                    aria-hidden
                  />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {tab === "recall" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={draftTriggers}
                    disabled={pending}
                  >
                    <Sparkles className="size-4" aria-hidden />
                    Draft triggers
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={askHint}
                    disabled={pending}
                  >
                    <Lightbulb className="size-4" aria-hidden />
                    Socratic hint
                  </Button>
                </div>
                {hint ? (
                  <p className="rounded-2xl border border-border bg-ink-sunken px-4 py-3 text-sm leading-relaxed">
                    {hint}
                  </p>
                ) : null}

                <Field
                  label="Trigger"
                  hint="The signal you noticed first — this is what Recall quizzes."
                  value={trigger}
                  onChange={setTrigger}
                  placeholder="sorted array + find a pair summing to target"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Pattern"
                    value={pattern}
                    onChange={setPattern}
                    placeholder="two pointers"
                  />
                  <Field
                    label="Complexity"
                    value={complexity}
                    onChange={setComplexity}
                    placeholder="O(n) time / O(1) space"
                  />
                </div>
                <Field
                  label="Approach"
                  value={approach}
                  onChange={setApproach}
                  placeholder="One or two sentences — not the full code"
                  multiline
                />
                <Field
                  label="Pitfalls"
                  value={pitfalls}
                  onChange={setPitfalls}
                  placeholder="Off-by-one on the right bound…"
                  multiline
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="confidence" className="text-sm text-muted">
                      Confidence
                    </label>
                    <span className="font-data text-sm" data-numeric>
                      {confidence}/5
                    </span>
                  </div>
                  <input
                    id="confidence"
                    type="range"
                    min={1}
                    max={5}
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[var(--band-expert)]"
                  />
                </div>
              </div>
            ) : null}

            {tab === "notes" ? (
              <NotesEditor initial={notes} onChange={setNotes} />
            ) : null}

            {tab === "board" ? (
              <DiagramCanvas
                initialElements={elements}
                initialAppState={appState}
                onChange={(els, state) => {
                  setElements(els);
                  setAppState(state);
                }}
              />
            ) : null}

            {tab === "code" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="language" className="text-sm text-muted">
                    Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 cursor-pointer rounded-lg border border-border bg-ink-sunken px-2 font-data text-xs"
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
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field h-auto min-h-[5rem] py-2.5"
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field"
        />
      )}
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
