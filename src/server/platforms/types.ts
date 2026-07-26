import type { PlatformId } from "@/lib/platforms";

export interface NormalizedDifficulty {
  easy: number | null;
  medium: number | null;
  hard: number | null;
}

export interface RatingPoint {
  at: string; // ISO date
  rating: number;
  contest?: string;
}

export interface TopicCount {
  name: string;
  count: number;
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface BadgeInfo {
  name: string;
  icon?: string;
}

export interface NormalizedProfile {
  handle: string;
  avatarUrl?: string | null;
  profileUrl?: string | null;
  totalSolved: number | null;
  difficulty: NormalizedDifficulty;
  rating: number | null;
  maxRating: number | null;
  contestsAttended: number | null;
  ranking: number | null;
  reputation: number | null;
  badges: BadgeInfo[];
  topics: TopicCount[];
  ratingHistory: RatingPoint[];
  activity: DailyCount[];
  raw?: unknown;
}

export type AdapterResult =
  | { ok: true; profile: NormalizedProfile }
  | { ok: false; error: string; code?: "NOT_FOUND" | "PRIVATE" | "RATE_LIMIT" | "UPSTREAM" };

export interface PlatformAdapter {
  platform: PlatformId;
  fetchProfile(handle: string): Promise<AdapterResult>;
  /** Read the public field used for ownership verification. */
  readVerificationField(handle: string): Promise<
    | { ok: true; value: string | null }
    | { ok: false; error: string }
  >;
}
