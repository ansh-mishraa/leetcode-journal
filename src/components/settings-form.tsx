"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/platforms";
import { Button } from "@/components/ui/button";

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

  return (
    <form
      className="glass-panel space-y-4 rounded-2xl p-5 md:p-6"
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
          else setMsg("Saved.");
        });
      }}
    >
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted">Display name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted">Public username</span>
        <div className="mt-0 flex items-center gap-2">
          <span className="font-data text-muted">/u/</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="[a-zA-Z0-9_-]+"
            className="field font-data"
            placeholder="your-handle"
          />
        </div>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="field h-auto min-h-[5.5rem] py-2.5"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-4 rounded border-border"
        />
        Public profile
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {msg ? <p className="text-sm text-band-pupil">{msg}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
