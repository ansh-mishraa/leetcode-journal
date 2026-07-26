"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/try";
  const callback = next.startsWith("/") ? next : "/try";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordLongEnough = password.length >= 8;

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
    router.push(callback);
    router.refresh();
  }

  return (
    <div className="animate-float-in">
      <div className="mt-10 lg:mt-0">
        <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
          Recall Engine
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Save problems, schedule reviews, build a mastery curve. Connecting
          platforms stays optional.
        </p>
      </div>

      <div className="mt-8">
        <SocialAuthButtons callbackURL={callback} />
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="new-password"
            aria-describedby="password-hint"
          />
          <p
            id="password-hint"
            className={`mt-1.5 flex items-center gap-1.5 text-xs ${
              password && passwordLongEnough ? "text-band-pupil" : "text-muted"
            }`}
          >
            {password && passwordLongEnough ? (
              <Check className="size-3.5" aria-hidden />
            ) : null}
            At least 8 characters
          </p>
        </div>
        {error ? (
          <p
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full justify-center text-base"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4" aria-hidden />
          )}
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login${next !== "/try" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="mt-10 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
