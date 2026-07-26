"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/session";
import { assertRefreshAllowed } from "@/lib/redis";
import type { PlatformId } from "@/lib/platforms";
import { PLATFORMS } from "@/lib/platforms";
import {
  connectPlatform,
  syncPlatformAccount,
  verifyPlatformOwnership,
} from "@/server/platforms/sync";
import { prisma } from "@/lib/db";

const connectSchema = z.object({
  platform: z.string(),
  handle: z.string().min(1).max(64),
});

export async function connectPlatformAction(input: {
  platform: string;
  handle: string;
}) {
  const session = await requireSession();
  const parsed = connectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const platform = parsed.data.platform.toUpperCase() as PlatformId;
  if (!PLATFORMS[platform] || platform === "GITHUB") {
    return { ok: false as const, error: "Unsupported platform" };
  }

  try {
    const account = await connectPlatform({
      userId: session.user.id,
      platform,
      handle: parsed.data.handle,
    });

    // Prefer Trigger.dev when configured
    try {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      if (process.env.TRIGGER_SECRET_KEY) {
        await tasks.trigger("sync-account", { accountId: account.id, platform });
      }
    } catch {
      // in-process sync already kicked in connectPlatform
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/platforms");
    return {
      ok: true as const,
      account: {
        id: account.id,
        platform: account.platform,
        handle: account.handle,
        verificationToken: account.verificationToken,
        status: account.status,
      },
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to connect",
    };
  }
}

export async function verifyPlatformAction(accountId: string) {
  const session = await requireSession();
  const account = await prisma.platformAccount.findFirst({
    where: { id: accountId, userId: session.user.id },
  });
  if (!account) return { ok: false as const, error: "Account not found" };

  try {
    if (process.env.TRIGGER_SECRET_KEY) {
      try {
        const { tasks } = await import("@trigger.dev/sdk/v3");
        const handle = await tasks.triggerAndWait("verify-ownership", {
          accountId,
        });
        if (handle.ok) {
          revalidatePath("/dashboard");
          revalidatePath("/dashboard/platforms");
          const output = handle.output as {
            verified: boolean;
            error?: string;
          };
          return output.verified
            ? { ok: true as const }
            : { ok: false as const, error: output.error ?? "Verification failed" };
        }
      } catch {
        // fall through to in-process
      }
    }

    const result = await verifyPlatformOwnership(accountId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/platforms");
    return result.verified
      ? { ok: true as const }
      : { ok: false as const, error: result.error ?? "Verification failed" };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

export async function refreshAllAction() {
  const session = await requireSession();
  const cooldown = await assertRefreshAllowed(session.user.id);
  if (!cooldown.allowed) {
    return {
      ok: false as const,
      error: "Refresh cooldown active — try again in a few minutes",
      resetAt: cooldown.resetAt,
    };
  }

  const accounts = await prisma.platformAccount.findMany({
    where: { userId: session.user.id },
    select: { id: true, platform: true },
  });

  const results = await Promise.allSettled(
    accounts.map((a) => syncPlatformAccount(a.id)),
  );

  revalidatePath("/dashboard");
  if (session.user.username) {
    revalidatePath(`/u/${session.user.username}`);
  }

  const failed = results.filter((r) => r.status === "rejected").length;
  return {
    ok: true as const,
    synced: accounts.length - failed,
    failed,
  };
}

export async function disconnectPlatformAction(accountId: string) {
  const session = await requireSession();
  await prisma.platformAccount.deleteMany({
    where: { id: accountId, userId: session.user.id },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/platforms");
  return { ok: true as const };
}

export async function updateProfileAction(input: {
  username?: string;
  bio?: string;
  isPublic?: boolean;
  name?: string;
}) {
  const session = await requireSession();
  const username = input.username?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (taken) return { ok: false as const, error: "Username taken" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: username || undefined,
      bio: input.bio,
      isPublic: input.isPublic,
      name: input.name,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  if (username) revalidatePath(`/u/${username}`);
  return { ok: true as const, username };
}
