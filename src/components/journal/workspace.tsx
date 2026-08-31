"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  Code2,
  FileText,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
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

type PanelId = "recall" | "notes" | "board" | "code";

const AUTOSAVE_IDLE_MS = 2000;

const PANEL_META: Record<
  PanelId,
  { label: string; icon: typeof Target }
> = {
  recall: { label: "Recall card", icon: Target },
  notes: { label: "Notes", icon: FileText },
  board: { label: "Whiteboard", icon: PenTool },
  code: { label: "Solution", icon: Code2 },
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
  // Held in a ref, not state: the canvas fires onChange on every pointer move,
  // and re-rendering the workspace from that feeds Excalidraw its own output.
  const diagram = useRef<{ elements: unknown; appState: unknown }>({
    elements: entry.diagram?.elements ?? [],
    appState: entry.diagram?.appState ?? {},
  });
  // The canvas is mounted lazily on first expand and then hidden rather than
  // unmounted, so unsaved strokes survive compress / expand.
  const [boardVisited, setBoardVisited] = useState(false);
  const [open, setOpen] = useState<Record<PanelId, boolean>>({
    recall: true,
    notes: true,
    board: false,
    code: true,
  });
  const [tall, setTall] = useState<Record<"notes" | "board" | "code", boolean>>({
    notes: false,
    board: false,
    code: false,
  });
  const [dirty, setDirty] = useState(false);
  const [dirtyTick, setDirtyTick] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const mounted = useRef(false);
  const dirtyRef = useRef(false);
  const pendingRef = useRef(false);

  const markDirty = useCallback(() => {
    setDirty(true);
    setDirtyTick((t) => t + 1);
  }, []);

  const setPanelOpen = useCallback((id: PanelId, next: boolean) => {
    setOpen((prev) => ({ ...prev, [id]: next }));
    if (id === "board" && next) setBoardVisited(true);
  }, []);

  const toggleTall = useCallback((id: "notes" | "board" | "code") => {
    setTall((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    markDirty();
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
    markDirty,
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
        diagramElements: diagram.current.elements,
        diagramAppState: diagram.current.appState,
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
  ]);

  const saveRef = useRef(save);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // Auto-save after 2s of idle once there are unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const id = window.setTimeout(() => {
      if (dirtyRef.current && !pendingRef.current) {
        saveRef.current();
      }
    }, AUTOSAVE_IDLE_MS);
    return () => window.clearTimeout(id);
  }, [dirty, dirtyTick, save]);

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

  const saveLabel = pending
    ? "Saving…"
    : dirty
      ? "Save"
      : "Saved";

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
              {pending
                ? " · auto-saving…"
                : dirty
                  ? " · unsaved · auto-saves after idle"
                  : savedAt
                    ? ` · saved ${savedAt}`
                    : ""}
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
              {saveLabel}
              {dirty && !pending ? <kbd className="kbd ml-1">⌘S</kbd> : null}
            </Button>
          </div>
        </div>
        {msg ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {msg}
          </p>
        ) : null}
        {!dirty && savedAt && trigger.trim() ? (
          <p className="mt-2 text-sm text-muted" role="status">
            Trigger saved — this problem is in your Recall deck.{" "}
            <Link
              href="/recall"
              className="font-medium text-band-expert underline-offset-2 hover:underline"
            >
              Open Recall
            </Link>{" "}
            when you want to grade it.
          </p>
        ) : !dirty && savedAt && !trigger.trim() ? (
          <p className="mt-2 text-sm text-muted" role="status">
            Tip: add a pattern trigger in the Recall card below — that&apos;s what
            you&apos;ll practice later.
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

        {/* Work surface — stacked collapsible panels */}
        <div className="space-y-3">
          <CollapsiblePanel
            id="recall"
            open={open.recall}
            onOpenChange={(next) => setPanelOpen("recall", next)}
          >
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
          </CollapsiblePanel>

          <CollapsiblePanel
            id="notes"
            open={open.notes}
            onOpenChange={(next) => setPanelOpen("notes", next)}
            tall={tall.notes}
            onToggleTall={() => toggleTall("notes")}
          >
            <NotesEditor
              initial={notes}
              onChange={setNotes}
              minHeightClassName={
                tall.notes ? "min-h-[560px]" : "min-h-[240px]"
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id="board"
            open={open.board}
            onOpenChange={(next) => setPanelOpen("board", next)}
            tall={tall.board}
            onToggleTall={() => toggleTall("board")}
            keepMounted={boardVisited}
          >
            {boardVisited ? (
              <DiagramCanvas
                initialElements={entry.diagram?.elements ?? null}
                initialAppState={entry.diagram?.appState ?? null}
                heightClassName={tall.board ? "h-[640px]" : "h-[480px]"}
                onChange={(els, state) => {
                  diagram.current = { elements: els, appState: state };
                  markDirty();
                }}
              />
            ) : (
              <div className="skeleton h-[420px] w-full rounded-2xl" />
            )}
          </CollapsiblePanel>

          <CollapsiblePanel
            id="code"
            open={open.code}
            onOpenChange={(next) => setPanelOpen("code", next)}
            tall={tall.code}
            onToggleTall={() => toggleTall("code")}
          >
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
                height={tall.code ? "560px" : "320px"}
              />
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
}

function CollapsiblePanel({
  id,
  open,
  onOpenChange,
  tall,
  onToggleTall,
  keepMounted = false,
  children,
}: {
  id: PanelId;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  tall?: boolean;
  onToggleTall?: () => void;
  keepMounted?: boolean;
  children: ReactNode;
}) {
  const meta = PANEL_META[id];
  const Icon = meta.icon;
  const panelId = `panel-${id}`;
  const showBody = open || keepMounted;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange(!open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-ink-sunken"
        >
          <Icon
            className={cn("size-4 shrink-0", open && "text-band-expert")}
            aria-hidden
          />
          <span className="truncate font-display text-base tracking-tight">
            {meta.label}
          </span>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted">
            {open ? "expanded" : "compressed"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {onToggleTall && open ? (
          <button
            type="button"
            onClick={onToggleTall}
            aria-pressed={tall}
            title={tall ? "Compress height" : "Expand height"}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted transition hover:bg-ink-sunken hover:text-foreground"
          >
            {tall ? (
              <Minimize2 className="size-4" aria-hidden />
            ) : (
              <Maximize2 className="size-4" aria-hidden />
            )}
            <span className="sr-only">
              {tall ? "Compress panel height" : "Expand panel height"}
            </span>
          </button>
        ) : null}
      </div>
      {showBody ? (
        <div
          id={panelId}
          className={cn("p-5", !open && "hidden")}
          aria-hidden={!open}
        >
          {children}
        </div>
      ) : null}
    </section>
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
