import { schedules, task, logger } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/db";
import {
  syncPlatformAccount,
  verifyPlatformOwnership,
} from "@/server/platforms/sync";

export const syncAccountTask = task({
  id: "sync-account",
  retry: { maxAttempts: 3 },
  queue: {
    // Concurrency keyed loosely by platform via payload handling
    concurrencyLimit: 5,
  },
  run: async (payload: { accountId: string; platform?: string }) => {
    logger.info("Syncing platform account", payload);
    const result = await syncPlatformAccount(payload.accountId);
    return result;
  },
});

export const verifyOwnershipTask = task({
  id: "verify-ownership",
  retry: { maxAttempts: 2 },
  run: async (payload: { accountId: string }) => {
    logger.info("Verifying ownership", payload);
    return verifyPlatformOwnership(payload.accountId);
  },
});

/** Daily sweep: fan out sync for accounts stale > 24h */
export const scheduledSyncSweep = schedules.task({
  id: "scheduled-sync-sweep",
  cron: "0 */6 * * *",
  run: async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await prisma.platformAccount.findMany({
      where: {
        OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: cutoff } }],
        status: { in: ["VERIFIED", "UNVERIFIED"] },
      },
      select: { id: true, platform: true },
      take: 500,
    });

    logger.info(`Sweeping ${stale.length} accounts`);

    const handles = await syncAccountTask.batchTrigger(
      stale.map((a) => ({
        payload: { accountId: a.id, platform: a.platform },
        options: {
          concurrencyKey: a.platform,
        },
      })),
    );

    return { enqueued: stale.length, batch: handles };
  },
});
