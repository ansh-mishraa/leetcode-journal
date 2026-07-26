import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NewEntryForm } from "@/components/journal/new-entry-form";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getDueCards } from "@/server/journal/fsrs";

export default async function JournalIndexPage() {
  const session = await requireSession();
  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    include: { problem: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const due = await getDueCards(session.user.id, 5);

  return (
    <AppShell active="/journal">
      <PageHeader
        eyebrow="Journal"
        title="Problem journal"
        description="Paste a LeetCode URL. Capture trigger → pattern, draw the structure, save your solution — Recall schedules the rest."
        action={
          <Button href="/recall" variant="secondary" className="h-9">
            Due today: {due.length}
          </Button>
        }
      />

      <NewEntryForm />

      {entries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-band-master/15 text-band-master">
            <BookOpen className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 font-display text-xl tracking-tight">
            Your first entry awaits
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Try{" "}
            <span className="font-data text-foreground">two-sum</span> or paste
            any{" "}
            <span className="font-data text-foreground">
              leetcode.com/problems/…
            </span>{" "}
            URL above.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {entries.map((e, i) => (
            <li
              key={e.id}
              className="animate-float-in"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <Link
                href={`/journal/${e.id}`}
                className="surface-interactive flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
              >
                <div>
                  <p className="font-medium">{e.problem.title}</p>
                  <p className="mt-0.5 font-data text-xs text-muted">
                    {e.problem.titleSlug} · {e.problem.difficulty ?? "?"} ·{" "}
                    {e.status}
                  </p>
                </div>
                <time
                  className="shrink-0 font-data text-xs text-muted"
                  dateTime={e.updatedAt.toISOString()}
                >
                  {e.updatedAt.toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
