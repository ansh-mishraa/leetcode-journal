"use client";

import { useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

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

  return (
    <div className="h-[480px] overflow-hidden rounded-lg border border-border">
      <Excalidraw
        excalidrawAPI={(a) => {
          api.current = a;
        }}
        initialData={{
          elements: Array.isArray(initialElements) ? (initialElements as never[]) : [],
          appState: {
            ...(typeof initialAppState === "object" && initialAppState
              ? initialAppState
              : {}),
            viewBackgroundColor: "transparent",
          } as never,
        }}
        onChange={(elements, appState) => {
          onChange(elements, {
            viewBackgroundColor: appState.viewBackgroundColor,
            currentItemStrokeColor: appState.currentItemStrokeColor,
            currentItemBackgroundColor: appState.currentItemBackgroundColor,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
          });
        }}
        theme="dark"
      />
    </div>
  );
}
