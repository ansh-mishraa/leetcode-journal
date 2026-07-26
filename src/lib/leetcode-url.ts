/** Extract LeetCode titleSlug from a URL or bare slug. */
export function extractTitleSlug(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-z0-9-]+$/i.test(raw)) {
    return raw.toLowerCase();
  }

  try {
    const u = new URL(raw);
    const m = u.pathname.match(/\/problems\/([a-z0-9-]+)(?:\/|$)/i);
    if (m) return m[1].toLowerCase();
    return null;
  } catch {
    return null;
  }
}
