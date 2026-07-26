import { LeetCode } from "leetcode-query";
import { prisma } from "@/lib/db";
import { extractTitleSlug } from "@/lib/leetcode-url";
import { toJson } from "@/lib/json";

const lc = new LeetCode();

export async function ingestProblemByUrlOrSlug(input: string) {
  const slug = extractTitleSlug(input);
  if (!slug) {
    throw new Error(
      "Could not parse a LeetCode problem slug. Paste a /problems/... URL or the slug itself.",
    );
  }

  const existing = await prisma.problem.findUnique({
    where: { source_titleSlug: { source: "LEETCODE", titleSlug: slug } },
  });
  // Refresh if older than 7 days
  if (
    existing &&
    Date.now() - existing.fetchedAt.getTime() < 7 * 24 * 60 * 60 * 1000
  ) {
    return existing;
  }

  const problem = await lc.problem(slug);
  if (!problem) {
    throw new Error(`Problem "${slug}" not found (or premium-gated).`);
  }

  const data = {
    title: problem.title ?? slug,
    frontendId: problem.questionFrontendId ?? null,
    difficulty: problem.difficulty ?? null,
    contentHtml: problem.content ?? null,
    topicTags: toJson(problem.topicTags ?? []),
    hints: toJson(problem.hints ?? []),
    codeSnippets: toJson(problem.codeSnippets ?? []),
    sampleTestCases: problem.exampleTestcases ?? problem.sampleTestCase ?? null,
    similarQuestions: problem.similarQuestions
      ? toJson(safeJson(problem.similarQuestions))
      : undefined,
    stats: problem.stats ? toJson(safeJson(problem.stats)) : undefined,
    isPaidOnly: Boolean(problem.isPaidOnly),
    fetchedAt: new Date(),
  };

  return prisma.problem.upsert({
    where: { source_titleSlug: { source: "LEETCODE", titleSlug: slug } },
    create: {
      source: "LEETCODE" as const,
      titleSlug: slug,
      ...data,
    },
    update: data,
  });
}

function safeJson(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
