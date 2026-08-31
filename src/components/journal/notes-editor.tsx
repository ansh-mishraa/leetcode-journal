"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export function NotesEditor({
  initial,
  onChange,
  minHeightClassName = "min-h-[240px]",
}: {
  initial: unknown;
  onChange: (doc: unknown) => void;
  minHeightClassName?: string;
}) {
  const editor = useCreateBlockNote({
    initialContent: Array.isArray(initial) && initial.length > 0 ? initial : undefined,
  });

  return (
    <div
      className={`${minHeightClassName} overflow-hidden rounded-lg border border-border bg-card`}
    >
      <BlockNoteView
        editor={editor}
        theme="dark"
        onChange={() => onChange(editor.document)}
      />
    </div>
  );
}
