"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Link2, Loader2, Unlink } from "lucide-react";
import {
  PLATFORMS,
  CONNECTABLE_PLATFORMS,
  type PlatformId,
} from "@/lib/platforms";
import {
  connectPlatformAction,
  disconnectPlatformAction,
  verifyPlatformAction,
} from "@/app/actions/platforms";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type AccountRow = {
  id: string;
  platform: PlatformId;
  handle: string;
  status: string;
  verificationToken: string | null;
  syncStatus: string;
  syncError: string | null;
  lastSyncedAt: string | null;
};

export function ConnectPlatforms({ accounts }: { accounts: AccountRow[] }) {
  const [platform, setPlatform] = useState<PlatformId>("LEETCODE");
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const byPlatform = useMemo(() => {
    const m = new Map<PlatformId, AccountRow>();
    for (const a of accounts) m.set(a.platform, a);
    return m;
  }, [accounts]);

  function onConnect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await connectPlatformAction({ platform, handle });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(
        `Connected @${res.account.handle}. Copy the token below into your ${PLATFORMS[platform].verificationField}, save it on that site, then hit Verify.`,
      );
      setHandle("");
    });
  }

  function onVerify(id: string) {
    setError(null);
    setMessage(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await verifyPlatformAction(id);
      setBusyId(null);
      if (!res.ok) setError(res.error);
      else
        setMessage(
          "Verified. You can remove the token from your platform profile now.",
        );
    });
  }

  function onDisconnect(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await disconnectPlatformAction(id);
      setBusyId(null);
      setMessage("Disconnected.");
    });
  }

  async function copyToken(token: string) {
    await navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onConnect} className="glass-panel rounded-2xl p-5 md:p-6">
        <h2 className="font-display text-xl tracking-tight">
          Connect a platform
        </h2>
        <p className="mt-1 text-sm text-muted">
          Stats sync immediately. Verification unlocks your public card.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[190px_1fr_auto]">
          <div>
            <label htmlFor="platform" className="sr-only">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformId)}
              className="field cursor-pointer"
            >
              {CONNECTABLE_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="handle" className="sr-only">
              Username or profile URL
            </label>
            <input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="username or profile URL"
              className="field font-data"
              required
            />
          </div>
          <Button type="submit" disabled={pending} className="md:min-w-[130px]">
            {pending && !busyId ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Link2 className="size-4" aria-hidden />
            )}
            Connect
          </Button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          {PLATFORMS[platform].verificationHint}
        </p>

        {error ? (
          <p
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {message ? (
          <p
            className="mt-4 rounded-xl border border-band-pupil/25 bg-band-pupil/10 px-3 py-2 text-sm text-band-pupil"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">Your platforms</h2>

        {accounts.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="Nothing connected yet"
            description="Start with LeetCode or Codeforces — public stats appear within seconds of connecting."
          />
        ) : (
          accounts.map((a) => {
            const meta = PLATFORMS[a.platform];
            const isBusy = busyId === a.id;
            return (
              <div
                key={a.id}
                className="surface-interactive flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between md:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-ink-sunken px-1.5 py-0.5 font-data text-[10px] text-muted">
                      {meta.short}
                    </span>
                    <span className="font-medium">{meta.label}</span>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="mt-1.5 font-data text-sm">@{a.handle}</p>

                  {a.syncError ? (
                    <p className="mt-1.5 text-xs text-destructive">
                      {a.syncError}
                    </p>
                  ) : a.lastSyncedAt ? (
                    <p className="mt-1.5 font-data text-xs text-muted">
                      Synced {new Date(a.lastSyncedAt).toLocaleString()}
                    </p>
                  ) : null}

                  {a.status !== "VERIFIED" && a.verificationToken ? (
                    <div className="mt-3 rounded-xl border border-border bg-ink-sunken p-3">
                      <p className="font-data text-[10px] uppercase tracking-wider text-muted">
                        Paste into {meta.verificationField}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <code className="rounded-lg bg-card px-2 py-1 font-data text-xs">
                          {a.verificationToken}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToken(a.verificationToken!)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition hover:bg-card hover:text-foreground"
                        >
                          {copied === a.verificationToken ? (
                            <>
                              <Check className="size-3.5 text-band-pupil" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy token
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {a.status !== "VERIFIED" ? (
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onVerify(a.id)}
                    >
                      {isBusy ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : null}
                      Verify
                    </Button>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onDisconnect(a.id)}
                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-muted transition hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                    aria-label={`Disconnect ${meta.label}`}
                  >
                    <Unlink className="size-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}

        {!byPlatform.has("GITHUB") ? (
          <p className="rounded-xl border border-border bg-ink-sunken px-4 py-3 text-sm text-muted">
            Shortcut: sign in with GitHub and we link that account automatically
            — no token needed.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const label =
    status === "VERIFIED"
      ? "Verified"
      : status === "FAILED"
        ? "Failed"
        : "Unverified";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-data text-[10px] uppercase tracking-wider",
        status === "VERIFIED" && "bg-band-pupil/15 text-band-pupil",
        status === "UNVERIFIED" && "bg-band-master/15 text-band-master",
        status === "FAILED" && "bg-destructive/15 text-destructive",
      )}
    >
      {label}
    </span>
  );
}
