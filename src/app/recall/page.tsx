import { Brain, Layers, Target, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewClient } from "@/components/journal/review-client";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getDueCards } from "@/server/journal/fsrs";
import { getMasteryCurve, getMasterySummary } from "@/server/journal/mastery";
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
        title={due.length > 0 ? `${due.length} due today` : "Recall Engine"}
        description="Graded drills on an FSRS schedule. Grade honestly — Again is progress, not failure."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button href="/try" variant="secondary">
              Try a problem
            </Button>
            <Button href="/journal" variant="ghost">
              Journal
            </Button>
          </div>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Due now"
          value={summary.dueToday}
          icon={Zap}
          accent="var(--band-expert)"
          hint="Cards ready to grade"
        />
        <StatCard
          label="Retention"
          value={`${summary.retentionScore}`}
          icon={Target}
          accent="var(--band-pupil)"
          hint="Composite of stability + accuracy"
        />
        <StatCard
          label="Mature cards"
          value={summary.matureCards}
          icon={Layers}
          hint="Stability over 7 days"
        />
        <StatCard
          label="Pattern triggers"
          value={triggerCount}
          icon={Brain}
          accent="var(--band-master)"
          hint="Your recognition library"
        />
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
