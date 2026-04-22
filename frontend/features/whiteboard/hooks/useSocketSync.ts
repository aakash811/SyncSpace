import { useEffect } from "react";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { usePresenceStore } from "@/features/board/store/presence.store";

export const useSocketSync = (boardId: string) => {
    const setShapes = useWhiteboardStore((state) => state.setShapes);
    const {token, user} = useAuthStore();
    const socket = getSocket(token || undefined);
    const setUsers = usePresenceStore((state) => state.setUsers);
    const upsertCursor = usePresenceStore((state) => state.upsertCursor);
    
    const userId = user?.id || "unknown";
    useEffect(() => {
        const joinBoard = () => {
            socket.emit("JOIN_BOARD", { boardId, userId });
        };

        if (socket.connected) {
            joinBoard();
        } else {
        socket.once("connect", joinBoard);
        }

        // Update active users list and cursors
        socket.on("ACTIVE_USERS", (users) => {
            setUsers(users);
        });

        socket.on("CURSOR_MOVE", (cursor) => {
            upsertCursor(cursor);
        })

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
            socket.off("ACTIVE_USERS");
            socket.off("CURSOR_MOVE");
            socket.off("BOARD_STATE");
            socket.off("STATE_UPDATE");
        };
    }, [boardId, userId]);
};