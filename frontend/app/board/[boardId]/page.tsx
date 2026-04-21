"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import Whiteboard from "@/features/whiteboard/components/Whiteboard";
import Toolbar from "@/features/whiteboard/components/Toolbar";
import CodeEditor from "@/features/code-editor/components/CodeEditor";
import TextEditor from "@/features/text-editor/components/TextEditor";
import { getSocket } from "@/lib/socket";
import { PenLine, Code2, ArrowLeft, FileText } from "lucide-react";

type Tab = "whiteboard" | "code" | "notes";
type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<Tab>("whiteboard");
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("connected");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const socket = getSocket(token);

    const onConnect = () => setConnStatus("connected");
    const onDisconnect = () => setConnStatus("disconnected");
    const onReconnecting = () => setConnStatus("reconnecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnecting);

    if (socket.connected) setConnStatus("connected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnecting);
    };
  }, [token]);

  if (!token || !boardId) return null;

  const statusConfig = {
    connected: { color: "bg-status-live", label: "Synced" },
    reconnecting: { color: "bg-status-syncing", label: "Reconnecting..." },
    disconnected: { color: "bg-status-offline", label: "Offline" },
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-surface">
      {/* Top nav */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${statusConfig[connStatus].color}`} />
            <span className="text-xs text-on-surface-muted">
              {statusConfig[connStatus].label}
            </span>
          </div>
        </div>

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
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === "notes"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <FileText size={16} />
            Notes
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
        {activeTab === "notes" && <TextEditor boardId={boardId} />}
      </div>
    </div>
  );
}
