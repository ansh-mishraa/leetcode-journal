"use client";

import { useTransition, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { refreshAllAction } from "@/app/actions/platforms";

export function RefreshButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          start(async () => {
            const res = await refreshAllAction();
            if (!res.ok) setMsg(res.error);
            else setMsg(`Synced ${res.synced} platform(s)`);
          });
        }}
        className="btn btn-secondary h-10 w-full text-sm disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Refresh
      </button>
      {msg ? <p className="mt-2 font-data text-xs text-muted">{msg}</p> : null}
    </div>
  );
}
