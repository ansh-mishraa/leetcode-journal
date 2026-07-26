"use server";

import { revalidatePath } from "next/cache";
import { requireSession, getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ingestProblemByUrlOrSlug } from "@/server/journal/ingest";
import {
  ensureReviewCard,
  reviewCard,
  findDiagnoseSibling,
} from "@/server/journal/fsrs";
import { draftPatternTriggers, socraticHint, isGroqConfigured } from "@/server/ai/groq";
import type { ReviewMode } from "@/generated/prisma/client";

/** Public: fetch problem for try-instantly (no auth). */
export async function previewProblemAction(urlOrSlug: string) {
  try {
    const problem = await ingestProblemByUrlOrSlug(urlOrSlug);
    return {
      ok: true as const,
      problem: {
        id: problem.id,
        title: problem.title,
        titleSlug: problem.titleSlug,
        difficulty: problem.difficulty,
        contentHtml: problem.contentHtml,
        topicTags: problem.topicTags,
        hints: problem.hints,
      },
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to load problem",
    };
  }
}

export async function createJournalEntryAction(input: {
  urlOrSlug: string;
}) {
  const session = await requireSession();
  try {
    const problem = await ingestProblemByUrlOrSlug(input.urlOrSlug);
    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      create: {
        userId: session.user.id,
        problemId: problem.id,
        status: "attempting",
      },
      update: {},
    });

    await ensureReviewCard(session.user.id, entry.id);
    await prisma.diagram.upsert({
      where: { entryId: entry.id },
      create: {
        entryId: entry.id,
        elements: [],
        appState: { viewBackgroundColor: "transparent" },
      },
      update: {},
    });

    revalidatePath("/journal");
    revalidatePath("/recall");
    return { ok: true as const, entryId: entry.id };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to create entry",
    };
  }
}

/** Claim a try-session problem into the signed-in journal. */
export async function claimPreviewAction(input: {
  titleSlug: string;
  pattern?: string;
  trigger?: string;
  approach?: string;
}) {
  const session = await requireSession();
  try {
    const problem = await ingestProblemByUrlOrSlug(input.titleSlug);
    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      create: {
        userId: session.user.id,
        problemId: problem.id,
        status: "attempting",
        pattern: input.pattern,
        trigger: input.trigger,
        approach: input.approach,
      },
      update: {
        pattern: input.pattern ?? undefined,
        trigger: input.trigger ?? undefined,
        approach: input.approach ?? undefined,
      },
    });
    await ensureReviewCard(session.user.id, entry.id);
    if (input.trigger && input.pattern) {
      await prisma.patternTrigger.create({
        data: {
          userId: session.user.id,
          entryId: entry.id,
          trigger: input.trigger,
          pattern: input.pattern,
          source: "manual",
        },
      });
    }
    revalidatePath("/journal");
    revalidatePath("/recall");
    return { ok: true as const, entryId: entry.id };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to claim",
    };
  }
}

export async function saveJournalEntryAction(input: {
  entryId: string;
  notes?: unknown;
  notesMd?: string;
  solution?: string;
  language?: string;
  approach?: string;
  pitfalls?: string;
  pattern?: string;
  trigger?: string;
  complexity?: string;
  confidence?: number;
  status?: string;
  diagramElements?: unknown;
  diagramAppState?: unknown;
}) {
  const session = await requireSession();
  const entry = await prisma.journalEntry.findFirst({
    where: { id: input.entryId, userId: session.user.id },
  });
  if (!entry) return { ok: false as const, error: "Entry not found" };

  await prisma.journalEntry.update({
    where: { id: entry.id },
    data: {
      notes: input.notes as object | undefined,
      notesMd: input.notesMd,
      solution: input.solution,
      language: input.language,
      approach: input.approach,
      pitfalls: input.pitfalls,
      pattern: input.pattern,
      trigger: input.trigger,
      complexity: input.complexity,
      confidence: input.confidence,
      status: input.status,
    },
  });

  if (input.trigger?.trim() && input.pattern?.trim()) {
    const existing = await prisma.patternTrigger.findFirst({
      where: {
        userId: session.user.id,
        entryId: entry.id,
        trigger: input.trigger.trim(),
      },
    });
    if (!existing) {
      await prisma.patternTrigger.create({
        data: {
          userId: session.user.id,
          entryId: entry.id,
          trigger: input.trigger.trim(),
          pattern: input.pattern.trim(),
          source: "manual",
        },
      });
    }
  }

  if (input.diagramElements !== undefined) {
    await prisma.diagram.upsert({
      where: { entryId: entry.id },
      create: {
        entryId: entry.id,
        elements: input.diagramElements as object[],
        appState: (input.diagramAppState as object) ?? {},
      },
      update: {
        elements: input.diagramElements as object[],
        appState: (input.diagramAppState as object) ?? undefined,
      },
    });
  }

  revalidatePath(`/journal/${entry.id}`);
  revalidatePath("/journal");
  return { ok: true as const };
}

export async function rateReviewAction(input: {
  cardId: string;
  rating: 1 | 2 | 3 | 4;
  mode?: ReviewMode;
  recalledPattern?: string;
}) {
  const session = await requireSession();
  try {
    await reviewCard(session.user.id, input.cardId, input.rating, {
      mode: input.mode,
      recalledPattern: input.recalledPattern,
    });
    revalidatePath("/journal/review");
    revalidatePath("/recall");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Review failed",
    };
  }
}

export async function getDiagnoseSiblingAction(entryId: string) {
  const session = await requireSession();
  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
  });
  if (!entry) return { ok: false as const, error: "Entry not found" };
  const sibling = await findDiagnoseSibling(
    session.user.id,
    entryId,
    entry.pattern,
  );
  if (!sibling) {
    return {
      ok: false as const,
      error:
        "Need another journaled problem with the same pattern for Diagnose mode.",
    };
  }
  return {
    ok: true as const,
    sibling: {
      id: sibling.id,
      title: sibling.problem.title,
      titleSlug: sibling.problem.titleSlug,
      difficulty: sibling.problem.difficulty,
      contentHtml: sibling.problem.contentHtml,
      pattern: sibling.pattern,
    },
  };
}

export async function groqDraftTriggersAction(entryId: string) {
  const session = await requireSession();
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      error: "Add GROQ_API_KEY to .env (free at console.groq.com)",
    };
  }
  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
    include: { problem: true },
  });
  if (!entry) return { ok: false as const, error: "Entry not found" };

  const drafted = await draftPatternTriggers({
    title: entry.problem.title,
    difficulty: entry.problem.difficulty,
    pattern: entry.pattern,
    approach: entry.approach,
    pitfalls: entry.pitfalls,
    notesMd: entry.notesMd,
  });
  if (!drafted.ok) return drafted;

  const created = [];
  for (const item of drafted.items) {
    const row = await prisma.patternTrigger.create({
      data: {
        userId: session.user.id,
        entryId: entry.id,
        trigger: item.trigger,
        pattern: item.pattern,
        notes: item.notes,
        source: "groq",
      },
    });
    created.push(row);
  }

  if (!entry.pattern && drafted.items[0]) {
    await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        pattern: drafted.items[0].pattern,
        trigger: drafted.items[0].trigger,
      },
    });
  }

  revalidatePath(`/journal/${entry.id}`);
  return { ok: true as const, items: created };
}

export async function groqSocraticAction(input: {
  entryId: string;
  stage: "pattern" | "approach" | "stuck";
  userGuess?: string;
}) {
  const session = await requireSession();
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      error: "Add GROQ_API_KEY to .env (free at console.groq.com)",
    };
  }
  const entry = await prisma.journalEntry.findFirst({
    where: { id: input.entryId, userId: session.user.id },
    include: { problem: true },
  });
  if (!entry) return { ok: false as const, error: "Entry not found" };

  const tags = Array.isArray(entry.problem.topicTags)
    ? (entry.problem.topicTags as Array<{ name?: string }>)
        .map((t) => t.name)
        .filter(Boolean)
    : [];

  return socraticHint({
    title: entry.problem.title,
    difficulty: entry.problem.difficulty,
    tags: tags as string[],
    userGuess: input.userGuess,
    stage: input.stage,
  });
}

export async function searchCommandAction(query: string) {
  const session = await getSession();
  if (!session) return { ok: true as const, results: [] as const };

  const q = query.trim();
  if (!q) {
    const due = await prisma.reviewCard.count({
      where: { userId: session.user.id, due: { lte: new Date() } },
    });
    return {
      ok: true as const,
      results: [
        {
          type: "nav" as const,
          label: `Due today (${due})`,
          href: "/recall",
        },
        {
          type: "nav" as const,
          label: "Try a problem",
          href: "/try",
        },
        {
          type: "nav" as const,
          label: "Journal",
          href: "/journal",
        },
        {
          type: "nav" as const,
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    };
  }

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { problem: { title: { contains: q, mode: "insensitive" } } },
        { problem: { titleSlug: { contains: q, mode: "insensitive" } } },
        { pattern: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { problem: true },
    take: 8,
  });

  return {
    ok: true as const,
    results: entries.map((e) => ({
      type: "entry" as const,
      label: e.problem.title,
      href: `/journal/${e.id}`,
      meta: e.pattern ?? e.problem.difficulty ?? undefined,
    })),
  };
}
