"use client";

import { Download } from "lucide-react";

export function ShareCardButton({ username }: { username: string }) {
  return (
    <a
      href={`/u/${username}/opengraph-image`}
      download={`${username}-leetcode-journal.png`}
      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-ink-raised"
    >
      <Download className="size-4" />
      Download card
    </a>
  );
}
