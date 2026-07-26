import { prisma } from "@/lib/db";
import { bandHex, type SkillBandKey } from "@/lib/spectrum";

export type MasteryPoint = {
  date: string;
  retentionScore: number;
  avgStability: number;
  reviews: number;
  bandColor: string;
};

/**
 * Retention / mastery curve — the "second Trajectory".
 * Derived from review logs: higher stability + fewer lapses = higher score.
 */
export async function getMasteryCurve(
  userId: string,
  skillBand: SkillBandKey = "NEWCOMER",
): Promise<MasteryPoint[]> {
  const logs = await prisma.reviewLog.findMany({
    where: { card: { userId } },
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      stability: true,
      rating: true,
    },
    take: 2000,
  });

  if (!logs.length) return [];

  const byDay = new Map<
    string,
    { stabilitySum: number; n: number; goods: number }
  >();

  for (const log of logs) {
    const date = log.createdAt.toISOString().slice(0, 10);
    const row = byDay.get(date) ?? { stabilitySum: 0, n: 0, goods: 0 };
    row.stabilitySum += log.stability;
    row.n += 1;
    if (log.rating >= 3) row.goods += 1;
    byDay.set(date, row);
  }

  const color = bandHex(skillBand);
  const points: MasteryPoint[] = [];

  for (const [date, row] of [...byDay.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const avgStability = row.stabilitySum / row.n;
    // Map stability (days) roughly into 0–100; good ratings boost
    const stabilityScore = Math.min(100, Math.log1p(avgStability) * 22);
    const accuracyBoost = (row.goods / row.n) * 20;
    const retentionScore = Math.round(
      Math.min(100, stabilityScore + accuracyBoost),
    );
    points.push({
      date,
      retentionScore,
      avgStability,
      reviews: row.n,
      bandColor: color,
    });
  }

  return points;
}

export async function getMasterySummary(userId: string) {
  const [due, cards, triggers] = await Promise.all([
    prisma.reviewCard.count({
      where: { userId, due: { lte: new Date() } },
    }),
    prisma.reviewCard.findMany({
      where: { userId },
      select: { stability: true, reps: true, lapses: true, state: true },
    }),
    prisma.patternTrigger.count({ where: { userId } }),
  ]);

  const avgStability =
    cards.length === 0
      ? 0
      : cards.reduce((s, c) => s + c.stability, 0) / cards.length;

  const mature = cards.filter((c) => c.stability >= 7).length;

  return {
    dueToday: due,
    totalCards: cards.length,
    matureCards: mature,
    avgStability,
    triggerCount: triggers,
    retentionScore:
      cards.length === 0
        ? 0
        : Math.round(
            Math.min(100, Math.log1p(avgStability) * 22 + (mature / cards.length) * 30),
          ),
  };
}
