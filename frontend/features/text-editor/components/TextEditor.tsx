"use client";

import { useTextEditorStore } from "../store/text-editor.store";
import { useTextSync } from "../hooks/useTextSync";
import { useState } from "react";
import { Eye, Edit3 } from "lucide-react";

type ViewMode = "write" | "preview";

function renderMarkdown(text: string): string {
  let html = text
    // Code blocks (``` ... ```)
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="md-code-block"><code>$2</code></pre>'
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Blockquote
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="md-blockquote">$1</blockquote>'
    )
    // Unordered list
    .replace(/^[-*] (.+)$/gm, '<li class="md-li">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Line breaks → paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");

  // Wrap loose list items
  html = html.replace(
    /(<li class="md-li">.*?<\/li>)+/g,
    '<ul class="md-ul">$&</ul>'
  );

  return `<p>${html}</p>`;
}

export default function TextEditor({ boardId }: { boardId: string }) {
  const { text, setText } = useTextEditorStore();
  const { emitTextUpdate } = useTextSync(boardId);
  const [viewMode, setViewMode] = useState<ViewMode>("write");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    emitTextUpdate(newText);
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2">
        <span className="text-sm font-medium text-on-surface-variant">
          Notes
        </span>

        <div className="flex rounded-lg bg-surface-container p-0.5">
          <button
            onClick={() => setViewMode("write")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              viewMode === "write"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <Edit3 size={13} />
            Write
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              viewMode === "preview"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "write" ? (
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Write your notes in Markdown..."
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent px-6 py-4 font-mono text-sm leading-relaxed text-on-surface placeholder:text-on-surface-subtle focus:outline-none"
          />
        ) : (
          <div
            className="markdown-preview h-full overflow-y-auto px-6 py-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
          />
        )}
      </div>
    </div>
  );
}
