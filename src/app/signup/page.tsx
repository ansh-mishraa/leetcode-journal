"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/try";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }
    router.push(next.startsWith("/") ? next : "/try");
    router.refresh();
  }

  return (
    <div className="glass-panel mt-8 rounded-2xl p-6 animate-float-in md:p-8">
      <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
        Recall Engine
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Save problems, schedule reviews, build your mastery curve. Platforms stay
        optional.
      </p>

      <ol className="mt-5 flex gap-2 font-data text-[10px] uppercase tracking-wider text-muted">
        <li className="rounded-full bg-band-expert/15 px-2.5 py-1 text-band-expert">
          1 Account
        </li>
        <li className="rounded-full bg-ink-sunken px-2.5 py-1">2 Journal</li>
        <li className="rounded-full bg-ink-sunken px-2.5 py-1">3 Recall</li>
      </ol>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            autoComplete="name"
          />
        </label>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating…" : "Create account"}
          {!loading ? <ArrowRight className="size-4" aria-hidden /> : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login${next !== "/try" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-foreground underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
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
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
