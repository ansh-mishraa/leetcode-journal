"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Loader2, Unlink } from "lucide-react";
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
        `Connected @${res.account.handle}. Copy the token below into your ${PLATFORMS[platform].verificationField}, save on that site, then hit Verify.`,
      );
      setHandle("");
    });
  }

  function onVerify(id: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await verifyPlatformAction(id);
      if (!res.ok) setError(res.error);
      else
        setMessage(
          "Verified. You can remove the token from your platform profile now.",
        );
    });
  }

  function onDisconnect(id: string) {
    startTransition(async () => {
      await disconnectPlatformAction(id);
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
      <form
        onSubmit={onConnect}
        className="glass-panel rounded-2xl p-5 md:p-6"
      >
        <h2 className="font-display text-xl tracking-tight">
          Connect a platform
        </h2>
        <p className="mt-1 text-sm text-muted">
          Stats sync immediately. Verification unlocks your public card.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as PlatformId)}
            className="field"
          >
            {CONNECTABLE_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="username or profile URL"
            className="field font-data"
            required
          />
          <Button type="submit" disabled={pending} className="md:min-w-[120px]">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Connect
          </Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {PLATFORMS[platform].verificationHint}
        </p>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p
            className="mt-3 rounded-xl bg-band-pupil/10 px-3 py-2 text-sm text-band-pupil"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">Your platforms</h2>
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-muted">
              Nothing connected yet. Start with LeetCode or Codeforces.
            </p>
          </div>
        ) : (
          accounts.map((a) => {
            const meta = PLATFORMS[a.platform];
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
                    <p className="mt-1 text-xs text-destructive">{a.syncError}</p>
                  ) : a.lastSyncedAt ? (
                    <p className="mt-1 font-data text-xs text-muted">
                      Synced {new Date(a.lastSyncedAt).toLocaleString()}
                    </p>
                  ) : null}
                  {a.status !== "VERIFIED" && a.verificationToken ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink-sunken p-2.5">
                      <code className="font-data text-xs">
                        {a.verificationToken}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToken(a.verificationToken!)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-card hover:text-foreground"
                      >
                        {copied === a.verificationToken ? (
                          <Check className="size-3.5 text-band-pupil" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        Copy
                      </button>
                      <span className="text-xs text-muted">
                        → {meta.verificationField}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {a.status !== "VERIFIED" ? (
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onVerify(a.id)}
                      className="h-9 px-4"
                    >
                      Verify
                    </Button>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onDisconnect(a.id)}
                    className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full border border-border px-3 text-sm text-muted transition hover:text-destructive"
                    aria-label={`Disconnect ${meta.label}`}
                  >
                    <Unlink className="size-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}

        {!byPlatform.has("GITHUB") ? (
          <p className="text-sm text-muted">
            Tip: Sign in with GitHub OAuth to link GitHub automatically — no
            token needed.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-data text-[10px] uppercase tracking-wider",
        status === "VERIFIED" && "bg-band-pupil/15 text-band-pupil",
        status === "UNVERIFIED" && "bg-band-master/15 text-band-master",
        status === "FAILED" && "bg-destructive/15 text-destructive",
      )}
    >
      {status}
    </span>
  );
}
