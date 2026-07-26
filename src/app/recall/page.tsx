import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReviewClient } from "@/components/journal/review-client";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getDueCards } from "@/server/journal/fsrs";
import {
  getMasteryCurve,
  getMasterySummary,
} from "@/server/journal/mastery";
import { prisma } from "@/lib/db";

export default async function RecallPage() {
  const session = await requireSession();
  const [due, summary, mastery, triggerCount] = await Promise.all([
    getDueCards(session.user.id, 30),
    getMasterySummary(session.user.id),
    getMasteryCurve(session.user.id),
    prisma.patternTrigger.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <AppShell active="/recall">
      <PageHeader
        eyebrow="Recall Engine"
        title="Due today"
        description="Graded drills — Recall the pattern, Re-implement cold, or Diagnose across problems. FSRS schedules honesty."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/try" variant="secondary">
              Try a problem
            </Button>
            <Link
              href="/journal"
              className="text-sm text-muted transition hover:text-foreground"
            >
              Journal →
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Due now", value: summary.dueToday },
          { label: "Mature cards", value: summary.matureCards },
          { label: "Pattern triggers", value: triggerCount },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl px-4 py-3">
            <p className="font-data text-[10px] uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="mt-1 font-data text-2xl" data-numeric>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <MasteryCurve points={mastery} className="mb-8" />

      <ReviewClient
        cards={due.map((c) => ({
          id: c.id,
          due: c.due.toISOString(),
          entryId: c.entryId,
          title: c.entry.problem.title,
          slug: c.entry.problem.titleSlug,
          difficulty: c.entry.problem.difficulty,
          pattern: c.entry.pattern,
          trigger: c.entry.trigger,
          contentHtml: c.entry.problem.contentHtml,
        }))}
      />
    </AppShell>
  );
}
