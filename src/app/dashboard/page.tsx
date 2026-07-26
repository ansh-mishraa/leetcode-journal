import { ArrowRight, Brain, Flame, Link2, NotebookPen, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";
import { RefreshButton } from "@/components/refresh-button";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { NextStepBanner } from "@/components/ui/next-step-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getAggregatedProfile } from "@/server/aggregation";
import { getMasteryCurve, getMasterySummary } from "@/server/journal/mastery";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requireSession();
  const [profile, entryCount, summary, mastery] = await Promise.all([
    getAggregatedProfile(session.user.id),
    prisma.journalEntry.count({ where: { userId: session.user.id } }),
    getMasterySummary(session.user.id),
    getMasteryCurve(session.user.id),
  ]);
  const platformCount = profile?.platforms.length ?? 0;

  const steps = [
    {
      id: "try",
      label: "Journal a problem",
      hint: "Paste a URL, capture trigger → pattern.",
      href: "/try",
      done: entryCount > 0,
      current: entryCount === 0,
    },
    {
      id: "recall",
      label: "Run a Recall session",
      hint: "Grade what's due so intervals adapt.",
      href: "/recall",
      done: summary.totalCards > 0 && summary.dueToday === 0,
      current: entryCount > 0 && summary.dueToday > 0,
    },
    {
      id: "connect",
      label: "Connect platforms (optional)",
      hint: "Unlock the Trajectory on your public card.",
      href: "/dashboard/platforms",
      done: platformCount > 0,
      current: entryCount > 0 && platformCount === 0,
    },
  ];

  return (
    <AppShell active="/dashboard">
      <PageHeader
        eyebrow="Profile"
        title="Your Trajectory"
        description="Shareable proof of progress. Retention lives in Recall — this is the reward layer."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              href="/recall"
              variant={summary.dueToday > 0 ? "primary" : "secondary"}
            >
              <Brain className="size-4" aria-hidden />
              {summary.dueToday > 0
                ? `Review ${summary.dueToday} due`
                : "Recall Engine"}
            </Button>
            {!session.user.username ? (
              <Button href="/dashboard/settings" variant="ghost">
                Claim @username
              </Button>
            ) : (
              <Button href={`/u/${session.user.username}`} variant="secondary">
                Share card
              </Button>
            )}
          </div>
        }
      />

      {steps.some((s) => !s.done) ? <NextStepBanner steps={steps} /> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Journal entries"
          value={entryCount}
          icon={NotebookPen}
          accent="var(--band-pupil)"
          href="/journal"
          hint="Problems with your own notes"
        />
        <StatCard
          label="Due today"
          value={summary.dueToday}
          icon={Brain}
          accent="var(--band-expert)"
          href="/recall"
          hint="Cards waiting to be graded"
        />
        <StatCard
          label="Retention"
          value={summary.retentionScore}
          icon={Target}
          hint="Stability + accuracy composite"
        />
        <StatCard
          label="Streak"
          value={profile ? `${profile.streaks.current}d` : "—"}
          icon={Flame}
          accent="var(--band-master)"
          hint={profile ? `Best ${profile.streaks.longest}d` : "Connect a platform"}
        />
      </div>

      <MasteryCurve points={mastery} className="mb-6" />

      {!profile || platformCount === 0 ? (
        <EmptyState
          icon={Link2}
          title="Trajectory unlocks with a platform"
          description="Optional — connect LeetCode or Codeforces when you want a shareable rating curve. Journal and Recall already work without it."
          actions={
            <>
              <Button href="/dashboard/platforms">
                Connect a platform
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button href="/try" variant="secondary">
                Journal another problem
              </Button>
            </>
          }
        />
      ) : (
        <ProfileView profile={profile} isOwner refreshSlot={<RefreshButton />} />
      )}
    </AppShell>
  );
}
