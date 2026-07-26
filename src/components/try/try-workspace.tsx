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

type Preview = {
  id: string;
  title: string;
  titleSlug: string;
  difficulty: string | null;
  contentHtml: string | null;
  topicTags: unknown;
};

const STORAGE_KEY = "lj-try-scratch";

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
      /* ignore */
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

  function loadProblem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await previewProblemAction(url);
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

  // Auto-claim when returning from signup with ?claim=
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
      <form
        onSubmit={loadProblem}
        className="glass-panel flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:p-5"
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a LeetCode URL or slug — e.g. two-sum"
          className="field flex-1 font-data"
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Load problem
        </Button>
      </form>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!preview ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <Sparkles className="mx-auto size-6 text-band-expert" aria-hidden />
          <h2 className="mt-4 font-display text-xl tracking-tight">
            Feel the product in 30 seconds
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            No account required. Load any problem, jot the pattern trigger, then
            save when you want spaced repetition.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-2xl p-5">
            <p className="font-data text-xs text-muted">{preview.titleSlug}</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight">
              {preview.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {preview.difficulty ? (
                <span className="rounded-full border border-border px-2 py-0.5 font-data text-xs">
                  {preview.difficulty}
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
            <div
              className="prose prose-invert mt-4 max-h-[420px] max-w-none overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{
                __html:
                  preview.contentHtml ?? "<p>No description available.</p>",
              }}
            />
          </section>

          <section className="space-y-4">
            <div className="glass-panel space-y-3 rounded-2xl p-5">
              <h3 className="font-display text-lg tracking-tight">
                Pattern trigger
              </h3>
              <p className="text-xs text-muted">
                What signal in the constraints points to the pattern? This is the
                skill interviews actually test.
              </p>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Trigger</span>
                <input
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="field"
                  placeholder="e.g. sorted array + find a pair with target sum"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Pattern</span>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="field"
                  placeholder="e.g. two pointers"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Approach (short)</span>
                <textarea
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  className="field h-auto min-h-[5rem] py-2.5"
                  placeholder="One or two sentences — not the full code"
                />
              </label>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <h3 className="font-display text-lg tracking-tight">
                {signedIn ? "Save to your Recall Engine" : "Ready to keep this?"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {signedIn
                  ? "We'll schedule a review so you don't forget it in two weeks."
                  : "Create a free account to schedule reviews and build your mastery curve."}
              </p>
              <Button
                type="button"
                className="mt-4 w-full"
                disabled={pending}
                onClick={saveForReal}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
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
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
