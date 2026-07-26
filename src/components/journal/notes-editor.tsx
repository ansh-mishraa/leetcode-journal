"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export function NotesEditor({
  initial,
  onChange,
}: {
  initial: unknown;
  onChange: (doc: unknown) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: Array.isArray(initial) && initial.length > 0 ? initial : undefined,
  });

  return (
    <div className="min-h-[240px] overflow-hidden rounded-lg border border-border bg-card">
      <BlockNoteView
        editor={editor}
        theme="dark"
        onChange={() => onChange(editor.document)}
      />
    </div>
  );
}
