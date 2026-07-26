"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import {
  previewProblemAction,
  claimPreviewAction,
} from "@/app/actions/journal";
import { Button } from "@/components/ui/button";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Preview = {
  id: string;
  title: string;
  titleSlug: string;
  difficulty: string | null;
  contentHtml: string | null;
  topicTags: unknown;
};

const STORAGE_KEY = "lj-try-scratch";
const SUGGESTIONS = ["two-sum", "valid-parentheses", "longest-substring-without-repeating-characters"];

type Scratch = {
  titleSlug: string;
  pattern: string;
  trigger: string;
  approach: string;
};

export function TryWorkspace({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState("");
  const [trigger, setTrigger] = useState("");
  const [approach, setApproach] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Scratch & { url?: string };
      if (data.url) setUrl(data.url);
      if (data.pattern) setPattern(data.pattern);
      if (data.trigger) setTrigger(data.trigger);
      if (data.approach) setApproach(data.approach);
    } catch {
      /* ignore malformed scratch */
    }
  }, []);

  useEffect(() => {
    if (!preview) return;
    const scratch: Scratch & { url: string } = {
      url,
      titleSlug: preview.titleSlug,
      pattern,
      trigger,
      approach,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scratch));
  }, [preview, url, pattern, trigger, approach]);

  const tags = useMemo(() => {
    if (!preview || !Array.isArray(preview.topicTags)) return [];
    return (preview.topicTags as Array<{ name?: string }>)
      .map((t) => t.name)
      .filter(Boolean) as string[];
  }, [preview]);

  function loadProblem(value: string) {
    setError(null);
    setLoadingPreview(true);
    start(async () => {
      const res = await previewProblemAction(value);
      setLoadingPreview(false);
      if (!res.ok) {
        setError(res.error);
        setPreview(null);
        return;
      }
      setPreview(res.problem);
    });
  }

  function saveForReal() {
    if (!preview) return;
    if (!signedIn) {
      const next = `/try?claim=${encodeURIComponent(preview.titleSlug)}`;
      router.push(`/signup?next=${encodeURIComponent(next)}`);
      return;
    }
    start(async () => {
      const res = await claimPreviewAction({
        titleSlug: preview.titleSlug,
        pattern,
        trigger,
        approach,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/journal/${res.entryId}`);
    });
  }

  // Returning from signup with ?claim= — pull scratch into a real entry
  useEffect(() => {
    if (!signedIn || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const claim = params.get("claim");
    if (!claim) return;
    start(async () => {
      const scratchRaw = localStorage.getItem(STORAGE_KEY);
      let scratch: Partial<Scratch> = {};
      try {
        scratch = scratchRaw ? JSON.parse(scratchRaw) : {};
      } catch {
        /* ignore */
      }
      const res = await claimPreviewAction({
        titleSlug: claim,
        pattern: scratch.pattern,
        trigger: scratch.trigger,
        approach: scratch.approach,
      });
      if (res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        router.replace(`/journal/${res.entryId}`);
      }
    });
  }, [signedIn, router]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-4 md:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProblem(url);
          }}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <label htmlFor="try-url" className="sr-only">
            LeetCode URL or slug
          </label>
          <input
            id="try-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a LeetCode URL or slug — e.g. two-sum"
            className="field flex-1 font-data"
            required
          />
          <Button type="submit" disabled={pending} className="shrink-0">
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ArrowRight className="size-4" aria-hidden />
            )}
            Load problem
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-data text-[10px] uppercase tracking-wider text-muted">
            Try one
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => {
                setUrl(s);
                loadProblem(s);
              }}
              className="chip font-data text-xs disabled:opacity-50"
            >
              {s.length > 24 ? `${s.slice(0, 24)}…` : s}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loadingPreview ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : !preview ? (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 45% 100% at 50% 0%, color-mix(in srgb, var(--band-expert) 14%, transparent), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-band-expert/12 text-band-expert">
              <Sparkles className="size-6" aria-hidden />
            </div>
            <h2 className="mt-5 font-display text-xl tracking-tight md:text-2xl">
              Feel the loop in 30 seconds
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Load any problem, write the signal that points to the pattern, and
              save only when it clicks. Nothing is stored until you do.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={difficultyTone(preview.difficulty)}>
                  {preview.difficulty ?? "unrated"}
                </Badge>
                <span className="font-data text-xs text-muted">
                  {preview.titleSlug}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl tracking-tight">
                {preview.title}
              </h2>
              {tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-2 py-0.5 font-data text-[10px] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div
              className="prose-problem max-h-[460px] overflow-y-auto px-5 py-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: preview.contentHtml ?? "<p>No description available.</p>",
              }}
            />
          </section>

          <section className="space-y-4">
            <div className="glass-panel space-y-4 rounded-2xl p-5">
              <div>
                <h3 className="font-display text-lg tracking-tight">
                  Pattern trigger
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  What signal in the constraints points to the pattern? This is
                  the skill interviews actually test.
                </p>
              </div>
              <div>
                <label htmlFor="try-trigger" className="mb-1.5 block text-sm text-muted">
                  Trigger
                </label>
                <input
                  id="try-trigger"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="field"
                  placeholder="sorted array + find a pair with target sum"
                />
              </div>
              <div>
                <label htmlFor="try-pattern" className="mb-1.5 block text-sm text-muted">
                  Pattern
                </label>
                <input
                  id="try-pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="field"
                  placeholder="two pointers"
                />
              </div>
              <div>
                <label htmlFor="try-approach" className="mb-1.5 block text-sm text-muted">
                  Approach
                </label>
                <textarea
                  id="try-approach"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  className="field h-auto min-h-[5rem] py-2.5"
                  placeholder="One or two sentences — not the full code"
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border bg-ink-raised p-5">
              <div
                className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full blur-2xl"
                aria-hidden
                style={{
                  background:
                    "color-mix(in srgb, var(--band-pupil) 22%, transparent)",
                }}
              />
              <div className="relative">
                <h3 className="font-display text-lg tracking-tight">
                  {signedIn ? "Save to your Recall Engine" : "Keep this one?"}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {signedIn
                    ? "We'll schedule the first review so this doesn't evaporate in two weeks."
                    : "Create a free account and we'll carry this trigger straight into your journal."}
                </p>
                <Button
                  type="button"
                  className="mt-4 h-12 w-full justify-center text-base"
                  disabled={pending}
                  onClick={saveForReal}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <ArrowRight className="size-4" aria-hidden />
                  )}
                  {signedIn ? "Save & schedule review" : "Save — create account"}
                </Button>
                {!signedIn ? (
                  <p className="mt-3 text-center text-xs text-muted">
                    Already have an account?{" "}
                    <Link
                      href={`/login?next=${encodeURIComponent(`/try?claim=${preview.titleSlug}`)}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
