"use client";

import { useState, useTransition } from "react";
import { Check, Globe, Loader2, Lock } from "lucide-react";
import { updateProfileAction } from "@/app/actions/platforms";
import { Button } from "@/components/ui/button";

const BIO_MAX = 200;

export function SettingsForm({
  initial,
}: {
  initial: {
    name: string;
    username: string;
    bio: string;
    isPublic: boolean;
  };
}) {
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const usernameValid = username === "" || /^[a-zA-Z0-9_-]+$/.test(username);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        setError(null);
        start(async () => {
          const res = await updateProfileAction({
            name,
            username,
            bio,
            isPublic,
          });
          if (!res.ok) setError(res.error);
          else setMsg("Saved");
        });
      }}
    >
      <div className="glass-panel space-y-5 rounded-2xl p-5 md:p-6">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
            Display name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm text-muted">
            Public username
          </label>
          <div className="flex items-center gap-2">
            <span className="font-data text-sm text-muted">/u/</span>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field font-data"
              placeholder="your-handle"
              aria-invalid={!usernameValid}
              aria-describedby="username-hint"
            />
          </div>
          <p
            id="username-hint"
            className={`mt-1.5 text-xs ${usernameValid ? "text-muted" : "text-destructive"}`}
          >
            {usernameValid
              ? username
                ? `Your card will live at /u/${username}`
                : "Letters, numbers, hyphens, and underscores."
              : "Only letters, numbers, hyphens, and underscores."}
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="bio" className="text-sm text-muted">
              Bio
            </label>
            <span
              className={`font-data text-xs ${bio.length > BIO_MAX ? "text-destructive" : "text-muted"}`}
              data-numeric
            >
              {bio.length}/{BIO_MAX}
            </span>
          </div>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="field h-auto min-h-[5.5rem] py-2.5"
            placeholder="Preparing for interviews · pattern-first"
          />
        </div>
      </div>

      <fieldset className="glass-panel rounded-2xl p-5 md:p-6">
        <legend className="sr-only">Profile visibility</legend>
        <div className="space-y-2">
          {[
            {
              value: true,
              icon: Globe,
              title: "Public",
              body: "Anyone with the link sees your Trajectory and mastery curve.",
            },
            {
              value: false,
              icon: Lock,
              title: "Private",
              body: "Only you can see your profile. The link returns a private notice.",
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const selected = isPublic === opt.value;
            return (
              <label
                key={opt.title}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                  selected
                    ? "border-band-expert/45 bg-band-expert/[0.07]"
                    : "border-border hover:bg-ink-sunken/60"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={selected}
                  onChange={() => setIsPublic(opt.value)}
                  className="sr-only"
                />
                <Icon
                  className={`mt-0.5 size-4 shrink-0 ${selected ? "text-band-expert" : "text-muted"}`}
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-medium">{opt.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {opt.body}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || !usernameValid}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {msg ? (
          <span
            className="inline-flex items-center gap-1.5 text-sm text-band-pupil"
            role="status"
          >
            <Check className="size-4" aria-hidden />
            {msg}
          </span>
        ) : null}
      </div>
    </form>
  );
}
