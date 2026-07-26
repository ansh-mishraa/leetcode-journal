"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

/** appState keys we persist — everything else is derived scene/session noise. */
function pickAppState(appState: {
  viewBackgroundColor?: string;
  currentItemStrokeColor?: string;
  currentItemBackgroundColor?: string;
  zoom?: unknown;
  scrollX?: number;
  scrollY?: number;
}) {
  return {
    viewBackgroundColor: appState.viewBackgroundColor,
    currentItemStrokeColor: appState.currentItemStrokeColor,
    currentItemBackgroundColor: appState.currentItemBackgroundColor,
    zoom: appState.zoom,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
  };
}

export function DiagramCanvas({
  initialElements,
  initialAppState,
  onChange,
}: {
  initialElements: unknown;
  initialAppState: unknown;
  onChange: (elements: unknown, appState: unknown) => void;
}) {
  const api = useRef<unknown>(null);

  // Excalidraw only reads initialData on mount, but a fresh object on every
  // render still re-renders it and re-fires onChange — an infinite loop once
  // the parent stores what onChange emits. Freeze it at mount instead.
  const [initialData] = useState(() => {
    const saved =
      typeof initialAppState === "object" && initialAppState
        ? (initialAppState as Record<string, unknown>)
        : {};
    return {
      elements: Array.isArray(initialElements) ? (initialElements as never[]) : [],
      appState: {
        ...saved,
        // Excalidraw expects a Map here; JSON round-trips it into an object.
        collaborators: new Map(),
        viewBackgroundColor: "transparent",
      } as never,
    };
  });

  // Kept in a ref so <Excalidraw> never sees a new onChange identity.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: Parameters<typeof pickAppState>[0]) => {
      onChangeRef.current(elements, pickAppState(appState));
    },
    [],
  );

  const handleApi = useCallback((a: unknown) => {
    api.current = a;
  }, []);

  return (
    <div className="h-[480px] overflow-hidden rounded-lg border border-border">
      <Excalidraw
        excalidrawAPI={handleApi}
        initialData={initialData}
        onChange={handleChange as never}
        theme="dark"
      />
    </div>
  );
}
