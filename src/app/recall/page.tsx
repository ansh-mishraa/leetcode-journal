import { ArrowRight, Brain, Layers, Target, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewClient } from "@/components/journal/review-client";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getDueCards } from "@/server/journal/fsrs";
import { getMasteryCurve, getMasterySummary } from "@/server/journal/mastery";
import { prisma } from "@/lib/db";

export default async function RecallPage() {
  const session = await requireSession();
  const [due, summary, mastery, triggerCount, entryCount] = await Promise.all([
    getDueCards(session.user.id, 30),
    getMasterySummary(session.user.id),
    getMasteryCurve(session.user.id),
    prisma.patternTrigger.count({ where: { userId: session.user.id } }),
    prisma.journalEntry.count({ where: { userId: session.user.id } }),
  ]);

  // Brand-new accounts: one invitation, not a wall of zeros.
  if (entryCount === 0) {
    return (
      <AppShell active="/recall">
        <PageHeader
          eyebrow="Practice recall"
          title="Add a problem first"
          description="Once you save a problem, we'll schedule review sessions to help you remember it long-term."
        />
        <EmptyState
          icon={Brain}
          accent="var(--band-expert)"
          title="No problems yet"
          description="Start by adding any LeetCode problem. Write what triggers the pattern. Then come back here to practice remembering it."
          actions={
            <>
              <Button href="/try">
                Add your first problem
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button href="/journal" variant="secondary">
                Open journal
              </Button>
            </>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell active="/recall">
      <PageHeader
        eyebrow="Practice recall"
        title={due.length > 0 ? `${due.length} ready to review` : "Up to date"}
        description="Test yourself on each problem. Grade honestly — struggling means you're learning."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button href="/try" variant="secondary">
              Add a problem
            </Button>
            <Button href="/journal" variant="ghost">
              Journal
            </Button>
          </div>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ready now"
          value={summary.dueToday}
          icon={Zap}
          accent="var(--band-expert)"
          hint="Problems to review today"
        />
        <StatCard
          label="Retention"
          value={`${summary.retentionScore}`}
          icon={Target}
          accent="var(--band-pupil)"
          hint="How well you remember"
        />
        <StatCard
          label="Strong recall"
          value={summary.matureCards}
          icon={Layers}
          hint="Problems you know well"
        />
        <StatCard
          label="Patterns saved"
          value={triggerCount}
          icon={Brain}
          accent="var(--band-master)"
          hint="Your pattern library"
        />
      </div>

      {mastery.length > 0 ? (
        <MasteryCurve points={mastery} className="mb-8" />
      ) : null}

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
