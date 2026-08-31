import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NewEntryForm } from "@/components/journal/new-entry-form";
import { JournalList } from "@/components/journal/journal-list";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

function dueLabel(due: Date | null): string | null {
  if (!due) return null;
  const diffMs = due.getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (diffMs <= 0) return "due now";
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days < 30) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
}

export default async function JournalIndexPage() {
  const session = await requireSession();
  const [entries, dueCount] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      include: { problem: true, reviewCards: { select: { due: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.reviewCard.count({
      where: { userId: session.user.id, due: { lte: new Date() } },
    }),
  ]);

  return (
    <AppShell active="/journal">
      <PageHeader
        eyebrow="Journal"
        title="Your saved problems"
        description="All your problems in one place. Add notes, draw diagrams, write solutions. We'll handle the review schedule."
        action={
          <Button
            href="/recall"
            variant={dueCount > 0 ? "primary" : "secondary"}
          >
            {dueCount > 0 ? `Review ${dueCount} due` : "Practice recall"}
          </Button>
        }
      />

      <NewEntryForm />

      {entries.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={BookOpen}
          accent="var(--band-master)"
          title="Start your collection"
          description="Paste any LeetCode URL above to add your first problem, or use Try for a guided walkthrough."
          actions={
            <Button href="/try">
              Start here
            </Button>
          }
        />
      ) : (
        <JournalList
          entries={entries.map((e) => ({
            id: e.id,
            title: e.problem.title,
            slug: e.problem.titleSlug,
            difficulty: e.problem.difficulty,
            pattern: e.pattern,
            trigger: e.trigger,
            status: e.status,
            updatedAt: e.updatedAt.toISOString(),
            dueLabel: dueLabel(e.reviewCards[0]?.due ?? null),
          }))}
        />
      )}
    </AppShell>
  );
}
