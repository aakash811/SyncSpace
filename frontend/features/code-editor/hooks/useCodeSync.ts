import { useEffect, useRef, useCallback } from "react";
import { useCodeEditorStore } from "../store/code-editor.store";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { CodeLanguage } from "../types";

export const useCodeSync = (boardId: string) => {
  const setCodeState = useCodeEditorStore((s) => s.setCodeState);
  const token = useAuthStore((s) => s.token);
  const socket = getSocket(token || undefined);
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Load initial code from board state
    const handleBoardState = (state: any) => {
      if (state?.code !== undefined) {
        setCodeState(state.code, state.language || "javascript");
      }
    };

    // Receive remote code updates
    const handleCodeUpdate = ({ code, language }: { code: string; language: CodeLanguage }) => {
      setCodeState(code, language);
    };

    socket.on("BOARD_STATE", handleBoardState);
    socket.on("CODE_UPDATE", handleCodeUpdate);

    return () => {
      socket.off("BOARD_STATE", handleBoardState);
      socket.off("CODE_UPDATE", handleCodeUpdate);
    };
  }, [boardId, socket, setCodeState]);

  // Throttled emit — 100ms for code (less aggressive than whiteboard)
  const emitCodeUpdate = useCallback(
    (code: string, language: CodeLanguage) => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
      }

      emitTimeoutRef.current = setTimeout(() => {
        socket.emit("CODE_UPDATE", { boardId, code, language });
        emitTimeoutRef.current = null;
      }, 100);
    },
    [boardId, socket]
  );

  return { emitCodeUpdate };
};
