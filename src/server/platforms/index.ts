import type { PlatformId } from "@/lib/platforms";
import type { PlatformAdapter } from "./types";
import { leetcodeAdapter } from "./leetcode";
import { codeforcesAdapter } from "./codeforces";
import { githubAdapter } from "./github";
import {
  atcoderAdapter,
  code360Adapter,
  codechefAdapter,
  gfgAdapter,
  hackerrankAdapter,
  interviewbitAdapter,
} from "./scrapers";

const adapters: Record<PlatformId, PlatformAdapter> = {
  LEETCODE: leetcodeAdapter,
  CODEFORCES: codeforcesAdapter,
  GITHUB: githubAdapter,
  CODECHEF: codechefAdapter,
  GEEKSFORGEEKS: gfgAdapter,
  HACKERRANK: hackerrankAdapter,
  ATCODER: atcoderAdapter,
  INTERVIEWBIT: interviewbitAdapter,
  CODE360: code360Adapter,
};

export function getAdapter(platform: PlatformId): PlatformAdapter {
  return adapters[platform];
}

export function listAdapters(): PlatformAdapter[] {
  return Object.values(adapters);
}

export type IntegrationHealth = {
  platform: PlatformId;
  status: "ok" | "degraded" | "down" | "unconfigured";
  message: string;
  checkedAt: string;
};

/** Lightweight health probe — does not hammer upstreams. */
export async function probeIntegrationHealth(): Promise<IntegrationHealth[]> {
  const now = new Date().toISOString();
  return (Object.keys(adapters) as PlatformId[]).map((platform) => {
    const official = platform === "CODEFORCES" || platform === "GITHUB";
    return {
      platform,
      status: official ? "ok" : "degraded",
      message: official
        ? "Official API"
        : platform === "LEETCODE"
          ? "Unofficial GraphQL — subject to Cloudflare / ToS risk"
          : "HTML / unofficial endpoint — may break without notice",
      checkedAt: now,
    };
  });
}
