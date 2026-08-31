"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

function langExt(language: string) {
  switch (language) {
    case "python":
      return python();
    case "java":
      return java();
    case "cpp":
      return cpp();
    case "javascript":
      return javascript();
    default:
      return javascript({ typescript: true });
  }
}

export function SolutionEditor({
  value,
  language,
  onChange,
  height = "320px",
}: {
  value: string;
  language: string;
  onChange: (v: string) => void;
  height?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={[langExt(language)]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: true }}
      />
    </div>
  );
}
