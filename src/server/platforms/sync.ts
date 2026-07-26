import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import type { PlatformId } from "@/lib/platforms";
import { PLATFORMS } from "@/lib/platforms";
import { getAdapter } from "./index";
import type { NormalizedProfile } from "./types";
import { outboundLimiter } from "@/lib/redis";
import { toJson } from "@/lib/json";
import {
  leetcodeRatingToCf,
  ratingToBand,
  type SkillBandKey,
} from "@/lib/spectrum";

const tokenAlphabet = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

export function generateVerificationToken() {
  return `lj-${tokenAlphabet()}`;
}

export async function connectPlatform(opts: {
  userId: string;
  platform: PlatformId;
  handle: string;
}) {
  const meta = PLATFORMS[opts.platform];
  if (!meta) throw new Error("Unknown platform");
  if (opts.platform === "GITHUB") {
    throw new Error("Connect GitHub via OAuth instead");
  }

  const handle = opts.handle.trim().replace(/^@/, "");
  if (!handle) throw new Error("Handle is required");

  const token = generateVerificationToken();

  const account = await prisma.platformAccount.upsert({
    where: {
      userId_platform: {
        userId: opts.userId,
        platform: opts.platform,
      },
    },
    create: {
      userId: opts.userId,
      platform: opts.platform,
      handle,
      status: "UNVERIFIED",
      verificationToken: token,
      profileUrl: meta.profileUrl(handle),
      syncStatus: "IDLE",
    },
    update: {
      handle,
      status: "UNVERIFIED",
      verificationToken: token,
      verifiedAt: null,
      profileUrl: meta.profileUrl(handle),
      syncError: null,
    },
  });

  // Kick off an async sync without blocking (best-effort in-process for now)
  void syncPlatformAccount(account.id).catch(() => undefined);

  return account;
}

export async function verifyPlatformOwnership(accountId: string) {
  const account = await prisma.platformAccount.findUnique({
    where: { id: accountId },
  });
  if (!account) throw new Error("Account not found");
  if (!account.verificationToken) {
    throw new Error("No verification token on this account");
  }

  const adapter = getAdapter(account.platform);
  const field = await adapter.readVerificationField(account.handle);
  if (!field.ok) {
    await prisma.platformAccount.update({
      where: { id: accountId },
      data: { status: "FAILED", syncError: field.error },
    });
    return { verified: false, error: field.error };
  }

  const value = field.value ?? "";
  const verified = value
    .toLowerCase()
    .includes(account.verificationToken.toLowerCase());

  if (!verified) {
    await prisma.platformAccount.update({
      where: { id: accountId },
      data: {
        status: "FAILED",
        syncError: `Token not found in ${PLATFORMS[account.platform].verificationField}`,
      },
    });
    return {
      verified: false,
      error: `Could not find the token in your ${PLATFORMS[account.platform].verificationField}. Make sure you saved the change and the profile is public.`,
    };
  }

  const updated = await prisma.platformAccount.update({
    where: { id: accountId },
    data: {
      status: "VERIFIED",
      verifiedAt: new Date(),
      syncError: null,
    },
  });

  void syncPlatformAccount(accountId).catch(() => undefined);
  return { verified: true, account: updated };
}

export async function syncPlatformAccount(accountId: string) {
  const account = await prisma.platformAccount.findUnique({
    where: { id: accountId },
  });
  if (!account) throw new Error("Account not found");

  const limiter = outboundLimiter(account.platform);
  if (limiter) {
    const { success } = await limiter.limit("global");
    if (!success) {
      await prisma.platformAccount.update({
        where: { id: accountId },
        data: {
          syncStatus: "ERROR",
          syncError: "Outbound rate limited — try again shortly",
        },
      });
      return { ok: false as const, error: "rate_limited" };
    }
  }

  await prisma.platformAccount.update({
    where: { id: accountId },
    data: { syncStatus: "SYNCING", syncError: null },
  });

  const adapter = getAdapter(account.platform);
  const result = await adapter.fetchProfile(account.handle);

  if (!result.ok) {
    await prisma.platformAccount.update({
      where: { id: accountId },
      data: {
        syncStatus: "ERROR",
        syncError: result.error,
      },
    });
    return { ok: false as const, error: result.error };
  }

  await persistSnapshot(account.id, account.userId, account.platform, result.profile);
  await recomputeUserSkillBand(account.userId);

  await prisma.platformAccount.update({
    where: { id: accountId },
    data: {
      syncStatus: "SUCCESS",
      lastSyncedAt: new Date(),
      syncError: null,
      avatarUrl: result.profile.avatarUrl ?? undefined,
      profileUrl: result.profile.profileUrl ?? undefined,
      handle: result.profile.handle || account.handle,
    },
  });

  return { ok: true as const, profile: result.profile };
}

async function persistSnapshot(
  platformAccountId: string,
  userId: string,
  platform: PlatformId,
  profile: NormalizedProfile,
) {
  await prisma.platformSnapshot.create({
    data: {
      platformAccountId,
      totalSolved: profile.totalSolved,
      easy: profile.difficulty.easy,
      medium: profile.difficulty.medium,
      hard: profile.difficulty.hard,
      rating: profile.rating,
      maxRating: profile.maxRating,
      contestsAttended: profile.contestsAttended,
      ranking: profile.ranking,
      reputation: profile.reputation,
      badges: toJson(profile.badges),
      topics: toJson(profile.topics),
      ratingHistory: toJson(profile.ratingHistory),
      raw: profile.raw != null ? toJson(profile.raw) : undefined,
    },
  });

  if (profile.activity.length) {
    for (const day of profile.activity) {
      await prisma.dailyActivity.upsert({
        where: {
          userId_platform_date: {
            userId,
            platform,
            date: new Date(day.date),
          },
        },
        create: {
          userId,
          platform,
          date: new Date(day.date),
          count: day.count,
        },
        update: { count: day.count },
      });
    }
  }
}

export async function recomputeUserSkillBand(userId: string) {
  const accounts = await prisma.platformAccount.findMany({
    where: { userId },
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
    },
  });

  let bestCfEquivalent = 0;
  for (const a of accounts) {
    const snap = a.snapshots[0];
    if (!snap?.rating) continue;
    const cf =
      a.platform === "LEETCODE"
        ? leetcodeRatingToCf(snap.rating)
        : a.platform === "CODEFORCES" || a.platform === "ATCODER" || a.platform === "CODECHEF"
          ? snap.rating
          : snap.rating;
    bestCfEquivalent = Math.max(bestCfEquivalent, cf);
  }

  const band: SkillBandKey = ratingToBand(bestCfEquivalent);
  await prisma.user.update({
    where: { id: userId },
    data: { skillBand: band },
  });
  return band;
}
