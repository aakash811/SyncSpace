import { useEffect, useRef, useCallback } from "react";
import { useTextEditorStore } from "../store/text-editor.store";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

export const useTextSync = (boardId: string) => {
  const setText = useTextEditorStore((s) => s.setText);
  const token = useAuthStore((s) => s.token);
  const socket = getSocket(token || undefined);
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleBoardState = (state: any) => {
      if (state?.text !== undefined) {
        setText(state.text);
      }
    };

    const handleTextUpdate = ({ text }: { text: string }) => {
      setText(text);
    };

    socket.on("BOARD_STATE", handleBoardState);
    socket.on("TEXT_UPDATE", handleTextUpdate);

    return () => {
      socket.off("BOARD_STATE", handleBoardState);
      socket.off("TEXT_UPDATE", handleTextUpdate);
    };
  }, [boardId, socket, setText]);

  const emitTextUpdate = useCallback(
    (text: string) => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
      }

      emitTimeoutRef.current = setTimeout(() => {
        socket.emit("TEXT_UPDATE", { boardId, text });
        emitTimeoutRef.current = null;
      }, 150);
    },
    [boardId, socket]
  );

  return { emitTextUpdate };
};
