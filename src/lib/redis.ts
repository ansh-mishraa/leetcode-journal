import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis = createRedis();

export const refreshCooldown = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "15 m"),
      prefix: "rl:refresh",
    })
  : null;

export function outboundLimiter(platform: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: `rl:outbound:${platform.toLowerCase()}`,
  });
}

/** Soft in-memory fallback when Redis is not configured (local/dev). */
const memoryCooldown = new Map<string, number>();

export async function assertRefreshAllowed(userId: string): Promise<{
  allowed: boolean;
  resetAt?: number;
}> {
  if (refreshCooldown) {
    const result = await refreshCooldown.limit(userId);
    return {
      allowed: result.success,
      resetAt: result.reset,
    };
  }

  const now = Date.now();
  const until = memoryCooldown.get(userId) ?? 0;
  if (now < until) {
    return { allowed: false, resetAt: until };
  }
  memoryCooldown.set(userId, now + 15 * 60 * 1000);
  return { allowed: true };
}
