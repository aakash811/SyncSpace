import { useEffect } from "react";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

export const useSocketSync = (boardId: string) => {
    const setShapes = useWhiteboardStore((state) => state.setShapes);
    const token = useAuthStore((state) => state.token);
    const socket = getSocket(token || undefined);

    useEffect(() => {
        const joinBoard = () => {
            socket.emit("JOIN_BOARD", { boardId });
        };

        // Join on mount
        joinBoard();

        // Re-join on reconnect
        socket.on("connect", joinBoard);

        // Initial state
        socket.on("BOARD_STATE", (state) => {
            if (state?.shapes) setShapes(state.shapes);
        });

        // Updates
        socket.on("STATE_UPDATE", (state) => {
            if (state?.shapes) setShapes(state.shapes);
        });

        return () => {
            socket.emit("LEAVE_BOARD", { boardId });
            socket.off("connect", joinBoard);
            socket.off("BOARD_STATE");
            socket.off("STATE_UPDATE");
        };
    }, [boardId]);
};