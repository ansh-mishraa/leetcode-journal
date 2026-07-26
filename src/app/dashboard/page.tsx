import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";
import { RefreshButton } from "@/components/refresh-button";
import { MasteryCurve } from "@/components/mastery-curve";
import { PageHeader } from "@/components/ui/page-header";
import { NextStepBanner } from "@/components/ui/next-step-banner";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { getAggregatedProfile } from "@/server/aggregation";
import {
  getMasteryCurve,
  getMasterySummary,
} from "@/server/journal/mastery";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requireSession();
  const [profile, entryCount, summary, mastery] = await Promise.all([
    getAggregatedProfile(session.user.id),
    prisma.journalEntry.count({ where: { userId: session.user.id } }),
    getMasterySummary(session.user.id),
    getMasteryCurve(session.user.id),
  ]);
  const verifiedCount =
    profile?.platforms.filter((p) => p.verified).length ?? 0;
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
      hint: "Grade Due Today when cards mature.",
      href: "/recall",
      done: summary.totalCards > 0 && summary.dueToday === 0,
      current: entryCount > 0 && summary.dueToday > 0,
    },
    {
      id: "connect",
      label: "Connect platforms (optional)",
      hint: "Unlock Trajectory for your public card.",
      href: "/dashboard/platforms",
      done: platformCount > 0,
      current: entryCount > 0 && platformCount === 0,
    },
  ];

  return (
    <AppShell active="/dashboard">
      <PageHeader
        eyebrow="Profile · credibility"
        title="Your Trajectory"
        description="Shareable proof of progress. Retention lives in Recall — this is the reward layer."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {summary.dueToday > 0 ? (
              <Button href="/recall">
                Due today ({summary.dueToday})
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button href="/recall" variant="secondary">
                <Brain className="size-4" aria-hidden />
                Recall Engine
              </Button>
            )}
            {!session.user.username ? (
              <Button href="/dashboard/settings" variant="secondary">
                Claim @username
              </Button>
            ) : (
              <Link
                href={`/u/${session.user.username}`}
                className="font-data text-sm text-muted transition hover:text-foreground"
              >
                /u/{session.user.username} →
              </Link>
            )}
          </div>
        }
      />

      {steps.some((s) => !s.done) ? <NextStepBanner steps={steps} /> : null}

      <MasteryCurve points={mastery} className="mb-6" />

      {!profile || platformCount === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center md:p-12">
          <h2 className="font-display text-2xl tracking-tight">
            Trajectory unlocks with a platform
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Optional — connect LeetCode or Codeforces when you want a shareable
            rating curve. You already get value from journal + Recall
            {entryCount > 0 ? ` (${entryCount} entries)` : ""}.
            {verifiedCount > 0 ? "" : ""}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/dashboard/platforms">
              Connect a platform
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button href="/try" variant="secondary">
              Journal another problem
            </Button>
          </div>
        </div>
      ) : (
        <ProfileView
          profile={profile}
          isOwner
          refreshSlot={<RefreshButton />}
        />
      )}
    </AppShell>
  );
}
