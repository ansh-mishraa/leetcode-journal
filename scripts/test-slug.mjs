function extractTitleSlug(input) {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-z0-9-]+$/i.test(raw)) return raw.toLowerCase();
  try {
    const u = new URL(raw);
    const m = u.pathname.match(/\/problems\/([a-z0-9-]+)(?:\/|$)/i);
    if (m) return m[1].toLowerCase();
    return null;
  } catch {
    return null;
  }
}

const cases = [
  ["two-sum", "two-sum"],
  ["https://leetcode.com/problems/two-sum/", "two-sum"],
  ["https://leetcode.com/problems/two-sum/description/", "two-sum"],
  ["https://leetcode.com/problems/two-sum/?envType=problem-list-v2", "two-sum"],
  ["https://leetcode.com/contest/weekly-contest-400/problems/foo-bar/", "foo-bar"],
  ["https://leetcode.cn/problems/add-two-numbers/", "add-two-numbers"],
  ["not a url!!!", null],
];

let failed = 0;
for (const [input, expected] of cases) {
  const got = extractTitleSlug(input);
  if (got !== expected) {
    console.error(`FAIL: ${input} → ${got} (expected ${expected})`);
    failed += 1;
  } else {
    console.log(`ok: ${input}`);
  }
}

process.exit(failed ? 1 : 0);
