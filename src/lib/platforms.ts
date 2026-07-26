export type PlatformId =
  | "LEETCODE"
  | "CODEFORCES"
  | "CODECHEF"
  | "GEEKSFORGEEKS"
  | "HACKERRANK"
  | "ATCODER"
  | "INTERVIEWBIT"
  | "CODE360"
  | "GITHUB";

export interface PlatformMeta {
  id: PlatformId;
  label: string;
  short: string;
  /** Public field the user must paste the verification token into. Null = OAuth. */
  verificationField: string | null;
  verificationHint: string;
  profileUrl: (handle: string) => string;
  enabled: boolean;
}

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  LEETCODE: {
    id: "LEETCODE",
    label: "LeetCode",
    short: "LC",
    verificationField: "Summary",
    verificationHint:
      "Paste the token into your LeetCode profile Summary, save, then click Verify. You can remove it afterward.",
    profileUrl: (h) => `https://leetcode.com/u/${h}/`,
    enabled: true,
  },
  CODEFORCES: {
    id: "CODEFORCES",
    label: "Codeforces",
    short: "CF",
    verificationField: "First Name (English)",
    verificationHint:
      "Settings → Social → First Name (English). Paste the token, save, verify.",
    profileUrl: (h) => `https://codeforces.com/profile/${h}`,
    enabled: true,
  },
  CODECHEF: {
    id: "CODECHEF",
    label: "CodeChef",
    short: "CC",
    verificationField: "Name",
    verificationHint: "Edit Profile → Name. Paste the token, save, verify.",
    profileUrl: (h) => `https://www.codechef.com/users/${h}`,
    enabled: true,
  },
  GEEKSFORGEEKS: {
    id: "GEEKSFORGEEKS",
    label: "GeeksforGeeks",
    short: "GFG",
    verificationField: "Display Name",
    verificationHint:
      "Edit Profile → Personal Details → Display Name. Paste the token, save, verify.",
    profileUrl: (h) => `https://www.geeksforgeeks.org/user/${h}/`,
    enabled: true,
  },
  HACKERRANK: {
    id: "HACKERRANK",
    label: "HackerRank",
    short: "HR",
    verificationField: "First Name",
    verificationHint: "Edit Profile → First Name. Paste the token, save, verify.",
    profileUrl: (h) => `https://www.hackerrank.com/${h}`,
    enabled: true,
  },
  ATCODER: {
    id: "ATCODER",
    label: "AtCoder",
    short: "AT",
    verificationField: "Affiliation",
    verificationHint: "Settings → Affiliation. Paste the token, save, verify.",
    profileUrl: (h) => `https://atcoder.jp/users/${h}`,
    enabled: true,
  },
  INTERVIEWBIT: {
    id: "INTERVIEWBIT",
    label: "InterviewBit",
    short: "IB",
    verificationField: "Bio",
    verificationHint:
      "Paste into Bio, set profile to Public, then verify. InterviewBit often flips Private after edits.",
    profileUrl: (h) => `https://www.interviewbit.com/profile/${h}`,
    enabled: true,
  },
  CODE360: {
    id: "CODE360",
    label: "Code360",
    short: "C360",
    verificationField: "Name",
    verificationHint: "Edit Profile → Name. Paste the token, save, verify.",
    profileUrl: (h) => `https://www.naukri.com/code360/profile/${h}`,
    enabled: true,
  },
  GITHUB: {
    id: "GITHUB",
    label: "GitHub",
    short: "GH",
    verificationField: null,
    verificationHint: "Connect via GitHub OAuth — verified automatically.",
    profileUrl: (h) => `https://github.com/${h}`,
    enabled: true,
  },
};

export const CONNECTABLE_PLATFORMS = Object.values(PLATFORMS).filter(
  (p) => p.verificationField !== null,
);
