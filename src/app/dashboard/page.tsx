import { ArrowRight, Brain, NotebookPen, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { NextStepBanner } from "@/components/ui/next-step-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getMasteryCurve, getMasterySummary } from "@/server/journal/mastery";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requireSession();
  const [entryCount, summary, mastery, reviewCount] = await Promise.all([
    prisma.journalEntry.count({ where: { userId: session.user.id } }),
    getMasterySummary(session.user.id),
    getMasteryCurve(session.user.id),
    prisma.reviewLog.count({
      where: { card: { userId: session.user.id } },
    }),
  ]);
  const hasJournaled = entryCount > 0;
  const hasRecalled = reviewCount > 0;

  const steps = [
    {
      id: "try",
      label: "Add your first problem",
      hint: "Pick any LeetCode problem and write what triggers the pattern.",
      href: "/try",
      done: hasJournaled,
      current: !hasJournaled,
    },
    {
      id: "recall",
      label: "Practice recall",
      hint:
        summary.dueToday > 0
          ? `${summary.dueToday} card${summary.dueToday === 1 ? "" : "s"} ready now.`
          : "Wait for your first card to come due, then test yourself.",
      href: "/recall",
      done: hasRecalled,
      current: hasJournaled && !hasRecalled,
    },
  ];

  // Zero-entry: one clear path, not stats + platform empty state.
  if (!hasJournaled) {
    return (
      <AppShell active="/dashboard">
        <PageHeader
          eyebrow="Profile"
          title="Welcome to KeepSolved"
          description="Your progress and retention stats will appear here as you solve problems and practice recall."
        />
        <NextStepBanner title="Get started" steps={steps} />
        <EmptyState
          icon={NotebookPen}
          accent="var(--band-pupil)"
          title="Ready to remember what you solve?"
          description="Add a problem, write the pattern trigger, then let the recall loop keep it fresh until interview day."
          actions={
            <Button href="/try">
              Add your first problem
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell active="/dashboard">
      <PageHeader
        eyebrow="Profile"
        title="Your progress"
        description="Track your retention and keep problems fresh until interview day."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              href={summary.dueToday > 0 ? "/recall" : "/try"}
              variant={summary.dueToday > 0 ? "primary" : "secondary"}
            >
              <Brain className="size-4" aria-hidden />
              {summary.dueToday > 0
                ? `Review ${summary.dueToday} due`
                : "Add a problem"}
            </Button>
            {!session.user.username ? (
              <Button href="/dashboard/settings" variant="ghost">
                Claim @username
              </Button>
            ) : (
              <Button href={`/u/${session.user.username}`} variant="secondary">
                Share profile
              </Button>
            )}
          </div>
        }
      />

      {steps.some((s) => !s.done) ? (
        <NextStepBanner title="Your next step" steps={steps} />
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Problems saved"
          value={entryCount}
          icon={NotebookPen}
          accent="var(--band-pupil)"
          href="/journal"
          hint="Your pattern collection"
        />
        <StatCard
          label="Due today"
          value={summary.dueToday}
          icon={Brain}
          accent="var(--band-expert)"
          href="/recall"
          hint="Ready to practice now"
        />
        <StatCard
          label="Retention"
          value={summary.retentionScore}
          icon={Target}
          hint="How well you remember"
        />
      </div>

      {mastery.length > 0 ? (
        <MasteryCurve points={mastery} className="mb-6" />
      ) : (
        <EmptyState
          icon={Brain}
          accent="var(--band-expert)"
          title="Your mastery curve will appear here"
          description="As you practice recall, you'll see your retention improve over time. Keep solving and reviewing."
          actions={
            <Button href={summary.dueToday > 0 ? "/recall" : "/try"}>
              {summary.dueToday > 0 ? "Practice recall now" : "Add another problem"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          }
        />
      )}
    </AppShell>
  );
}
