import { createEmptyCard, fsrs, generatorParameters, Rating, State } from "ts-fsrs";
import { prisma } from "@/lib/db";
import type { ReviewMode } from "@/generated/prisma/client";

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

const stateMap = {
  [State.New]: "New",
  [State.Learning]: "Learning",
  [State.Review]: "Review",
  [State.Relearning]: "Relearning",
} as const;

export async function ensureReviewCard(userId: string, entryId: string) {
  const existing = await prisma.reviewCard.findUnique({
    where: { userId_entryId: { userId, entryId } },
  });
  if (existing) return existing;

  const card = createEmptyCard(new Date());
  return prisma.reviewCard.create({
    data: {
      userId,
      entryId,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: card.elapsed_days,
      scheduledDays: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: stateMap[card.state],
      learningSteps: card.learning_steps,
    },
  });
}

export async function reviewCard(
  userId: string,
  cardId: string,
  rating: 1 | 2 | 3 | 4,
  opts?: {
    mode?: ReviewMode;
    recalledPattern?: string;
  },
) {
  const row = await prisma.reviewCard.findFirst({
    where: { id: cardId, userId },
  });
  if (!row) throw new Error("Card not found");

  const mode = opts?.mode ?? "RECALL";

  const card = {
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsedDays,
    scheduled_days: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    state: State[row.state],
    last_review: row.lastReview ?? undefined,
    learning_steps: row.learningSteps,
  };

  const ratingEnum =
    rating === 1
      ? Rating.Again
      : rating === 2
        ? Rating.Hard
        : rating === 3
          ? Rating.Good
          : Rating.Easy;

  const next = scheduler.next(card, new Date(), ratingEnum);

  const updated = await prisma.reviewCard.update({
    where: { id: cardId },
    data: {
      due: next.card.due,
      stability: next.card.stability,
      difficulty: next.card.difficulty,
      elapsedDays: next.card.elapsed_days,
      scheduledDays: next.card.scheduled_days,
      reps: next.card.reps,
      lapses: next.card.lapses,
      state: stateMap[next.card.state],
      learningSteps: next.card.learning_steps,
      lastReview: new Date(),
      lastMode: mode,
    },
  });

  await prisma.reviewLog.create({
    data: {
      cardId,
      rating,
      mode,
      recalledPattern: opts?.recalledPattern,
      state: stateMap[next.card.state],
      due: next.card.due,
      stability: next.card.stability,
    },
  });

  return updated;
}

export async function getDueCards(userId: string, limit = 20) {
  return prisma.reviewCard.findMany({
    where: {
      userId,
      due: { lte: new Date() },
    },
    include: {
      entry: {
        include: { problem: true },
      },
    },
    orderBy: { due: "asc" },
    take: limit,
  });
}

/** Pick another journaled problem with the same pattern for Diagnose mode. */
export async function findDiagnoseSibling(
  userId: string,
  entryId: string,
  pattern: string | null | undefined,
) {
  if (!pattern?.trim()) return null;
  return prisma.journalEntry.findFirst({
    where: {
      userId,
      id: { not: entryId },
      pattern: { equals: pattern, mode: "insensitive" },
    },
    include: { problem: true },
    orderBy: { updatedAt: "desc" },
  });
}
