import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JournalWorkspace } from "@/components/journal/workspace";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    select: { problem: { select: { title: true } } },
  });
  return { title: entry?.problem.title ?? "Journal entry" };
}

export default async function JournalEntryPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
    include: { problem: true, diagram: true },
  });
  if (!entry) notFound();

  return (
    <AppShell active="/journal">
      <JournalWorkspace
        entry={{
          id: entry.id,
          approach: entry.approach,
          pitfalls: entry.pitfalls,
          pattern: entry.pattern,
          trigger: entry.trigger,
          complexity: entry.complexity,
          confidence: entry.confidence,
          status: entry.status,
          notes: entry.notes,
          solution: entry.solution,
          language: entry.language,
          diagram: entry.diagram
            ? {
                elements: entry.diagram.elements,
                appState: entry.diagram.appState,
              }
            : null,
        }}
        problem={{
          title: entry.problem.title,
          titleSlug: entry.problem.titleSlug,
          difficulty: entry.problem.difficulty,
          contentHtml: entry.problem.contentHtml,
          topicTags: entry.problem.topicTags,
        }}
      />
    </AppShell>
  );
}
