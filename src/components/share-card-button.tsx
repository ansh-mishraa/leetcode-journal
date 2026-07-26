"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

function profileUrl(username: string) {
  return `${window.location.origin}/u/${username}`;
}

export function ShareCardButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = profileUrl(username);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy profile link", url);
    }
  }

  function postToX() {
    const text = `My coding trajectory on KeepSolved — solve once, still know it on interview day.\n${profileUrl(username)}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function nativeShare() {
    const url = profileUrl(username);
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `@${username} · KeepSolved`,
        text: "My coding trajectory on KeepSolved",
        url,
      });
    } catch {
      // cancelled
    }
  }

  const chip =
    "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm transition hover:bg-ink-raised";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copyLink} className={chip}>
        {copied ? (
          <Check className="size-4 text-[var(--band-pupil)]" />
        ) : (
          <Copy className="size-4" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={postToX} className={chip}>
        <span className="font-data text-xs">𝕏</span>
        Post
      </button>
      <button
        type="button"
        onClick={nativeShare}
        className={cn(chip, "md:hidden")}
      >
        <Share2 className="size-4" />
        Share
      </button>
      <a
        href={`/u/${username}/opengraph-image`}
        download={`${username}-keepsolved.png`}
        className={chip}
      >
        <Download className="size-4" />
        Card
      </a>
    </div>
  );
}
