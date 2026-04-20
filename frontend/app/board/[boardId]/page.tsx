"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import Whiteboard from "@/features/whiteboard/components/Whiteboard";
import Toolbar from "@/features/whiteboard/components/Toolbar";
import CodeEditor from "@/features/code-editor/components/CodeEditor";
import { PenLine, Code2, ArrowLeft } from "lucide-react";

type Tab = "whiteboard" | "code";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<Tab>("whiteboard");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!token || !boardId) return null;

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-surface">
      {/* Top nav */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface-container p-1">
          <button
            onClick={() => setActiveTab("whiteboard")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === "whiteboard"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <PenLine size={16} />
            Whiteboard
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === "code"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <Code2 size={16} />
            Code
          </button>
        </div>

        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      {/* Content area */}
      <div className="relative flex-1">
        {activeTab === "whiteboard" && (
          <>
            <Toolbar />
            <Whiteboard boardId={boardId} />
          </>
        )}
        {activeTab === "code" && <CodeEditor boardId={boardId} />}
      </div>
    </div>
  );
}
