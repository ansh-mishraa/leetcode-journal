"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { oauthProviders, hasAnyOAuth } from "@/lib/auth-providers";
import { Button } from "@/components/ui/button";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.4-1.9 3.1l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3 4.5 14.9l-2.7 2.1C3.5 20.1 7.5 22.5 12 22.5c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3 7.1A10.4 10.4 0 0 0 2 12c0 1.7.4 3.4 1.1 4.8l3.2-2.5A6.2 6.2 0 0 1 5.8 12c0-1 .3-2 .8-2.8L3 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.4 14.7 1.5 12 1.5 7.5 1.5 3.5 4 1.8 7.1l3.2 2.5C6.9 7.3 9.2 5.4 12 5.4z"
      />
    </svg>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.28 10.28 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export function SocialAuthButtons({
  callbackURL,
}: {
  callbackURL: string;
}) {
  const [busy, setBusy] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!hasAnyOAuth) return null;

  async function start(provider: "google" | "github") {
    setError(null);
    setBusy(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: "/login",
      });
    } catch (err) {
      setBusy(null);
      setError(
        err instanceof Error
          ? err.message
          : "Could not start social sign-in. Check OAuth env vars.",
      );
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {oauthProviders.google ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center"
            disabled={busy !== null}
            onClick={() => start("google")}
          >
            {busy === "google" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <GoogleMark className="size-4" />
            )}
            Continue with Google
          </Button>
        ) : null}
        {oauthProviders.github ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center"
            disabled={busy !== null}
            onClick={() => start("github")}
          >
            {busy === "github" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <GitHubMark className="size-4" />
            )}
            Continue with GitHub
          </Button>
        ) : null}
      </div>
      {error ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="relative flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-data text-[10px] uppercase tracking-wider text-muted">
          or email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
