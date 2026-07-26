"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/recall";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign in failed");
      return;
    }
    router.push(next.startsWith("/") ? next : "/recall");
    router.refresh();
  }

  const callback = next.startsWith("/") ? next : "/recall";

  return (
    <>
      <div className="glass-panel mt-8 rounded-2xl p-6 animate-float-in md:p-8">
        <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Pick up your Recall queue, journal, and Trajectory.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? <ArrowRight className="size-4" aria-hidden /> : null}
          </Button>
        </form>

        <div className="relative my-5 text-center">
          <span className="bg-card px-3 font-data text-[10px] uppercase tracking-wider text-muted">
            or
          </span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>

        <div className="grid gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              authClient.signIn.social({
                provider: "github",
                callbackURL: callback,
              })
            }
          >
            Continue with GitHub
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: callback,
              })
            }
          >
            Continue with Google
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        No account?{" "}
        <Link
          href={`/signup${next !== "/recall" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-foreground underline-offset-2 hover:underline"
        >
          Create one free
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="ambient-stage flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link href="/" className="font-display text-xl tracking-tight">
          LeetCode Journal
        </Link>
        <Suspense
          fallback={
            <div className="glass-panel mt-8 h-80 animate-pulse rounded-2xl" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
