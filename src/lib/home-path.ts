import { prisma } from "@/lib/db";

/**
 * Single post-auth destination so new users never land on an empty Recall
 * dashboard and wonder what to do.
 */
export async function resolveHomePath(userId: string): Promise<string> {
  const [entryCount, dueToday] = await Promise.all([
    prisma.journalEntry.count({ where: { userId } }),
    prisma.reviewCard.count({
      where: { userId, due: { lte: new Date() } },
    }),
  ]);

  if (entryCount === 0) return "/try";
  if (dueToday > 0) return "/recall";
  return "/journal";
}
