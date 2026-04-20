"use client";

import Editor from "@monaco-editor/react";
import { useCodeEditorStore } from "../store/code-editor.store";
import { useCodeSync } from "../hooks/useCodeSync";
import { CodeLanguage } from "../types";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export default function CodeEditor({ boardId }: { boardId: string }) {
  const { code, language, setCode, setLanguage } = useCodeEditorStore();
  const { emitCodeUpdate } = useCodeSync(boardId);
  const isRemoteUpdate = useRef(false);

  const handleChange = (value: string | undefined) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const newCode = value ?? "";
    setCode(newCode);
    emitCodeUpdate(newCode, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as CodeLanguage;
    setLanguage(newLang);
    emitCodeUpdate(code, newLang);
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2">
        <span className="text-sm font-medium text-on-surface-variant">
          Code Editor
        </span>

        <div className="relative">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="appearance-none rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 pr-8 text-xs font-medium text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-muted"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            tabSize: 2,
            wordWrap: "on",
            automaticLayout: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
}
