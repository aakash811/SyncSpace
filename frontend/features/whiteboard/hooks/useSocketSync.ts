import { useEffect } from "react";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { getSocket } from "@/lib/socket";

export const useSocketSync = (boardId: string) => {
    const setShapes = useWhiteboardStore((state) => state.setShapes);
    const socket = getSocket();

    useEffect(() => {
        //JOIN BOARD
        socket.emit("JOIN_BOARD", {boardId});

        //INITIAL STATE
        socket.on("BOARD_STATE", (state) => {
            if(state?.shapes) setShapes(state.shapes);
        });

        //UPDATES
        socket.on("STATE_UPDATE", (state) => {
            if(state?.shapes) setShapes(state.shapes);
        });

        return () => {
            socket.off("BOARD_STATE");
            socket.off("STATE_UPDATE");
        };
    }, [boardId]);
};