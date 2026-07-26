export type SkillBandKey =
  | "NEWCOMER"
  | "PUPIL"
  | "SPECIALIST"
  | "EXPERT"
  | "CANDIDATE_MASTER"
  | "MASTER"
  | "GRANDMASTER";

export const SKILL_BANDS: Record<
  SkillBandKey,
  { label: string; colorVar: string; hex: string; minRating: number }
> = {
  NEWCOMER: {
    label: "Newcomer",
    colorVar: "--band-newcomer",
    hex: "#9CA3AF",
    minRating: 0,
  },
  PUPIL: {
    label: "Pupil",
    colorVar: "--band-pupil",
    hex: "#10B981",
    minRating: 1200,
  },
  SPECIALIST: {
    label: "Specialist",
    colorVar: "--band-specialist",
    hex: "#06B6D4",
    minRating: 1400,
  },
  EXPERT: {
    label: "Expert",
    colorVar: "--band-expert",
    hex: "#3B82F6",
    minRating: 1600,
  },
  CANDIDATE_MASTER: {
    label: "Candidate Master",
    colorVar: "--band-candidate-master",
    hex: "#8B5CF6",
    minRating: 1900,
  },
  MASTER: {
    label: "Master",
    colorVar: "--band-master",
    hex: "#F59E0B",
    minRating: 2100,
  },
  GRANDMASTER: {
    label: "Grandmaster",
    colorVar: "--band-grandmaster",
    hex: "#EF4444",
    minRating: 2400,
  },
};

/** Map a rating (prefer Codeforces-scale) onto a skill band. */
export function ratingToBand(rating: number | null | undefined): SkillBandKey {
  if (rating == null || Number.isNaN(rating) || rating <= 0) return "NEWCOMER";
  const ordered = Object.entries(SKILL_BANDS).sort(
    (a, b) => b[1].minRating - a[1].minRating,
  ) as [SkillBandKey, (typeof SKILL_BANDS)[SkillBandKey]][];
  for (const [key, meta] of ordered) {
    if (rating >= meta.minRating) return key;
  }
  return "NEWCOMER";
}

/** Approximate Codeforces-equivalent from LeetCode contest rating. */
export function leetcodeRatingToCf(lcRating: number): number {
  // Rough linear map used for band coloring only — not a claim of equivalence.
  return Math.round(lcRating * 0.85);
}

export function bandHex(band: SkillBandKey): string {
  return SKILL_BANDS[band].hex;
}
