import { getBoardState, flushBoard } from "../services/stateBuffer.service.js";
import { handleStateUpdate } from "./handlers/state.handler.js";
import { handleCodeUpdate } from "./handlers/code.handler.js";
import { handleTextUpdate } from "./handlers/text.handler.js";

export const initBoardSocket = (io, socket) => {
        // Track which boards this socket is in
        const joinedBoards = new Set();

        // Join a board room
        socket.on("JOIN_BOARD", async ({boardId}) => {
            socket.join(boardId);
            joinedBoards.add(boardId);
            console.log(`Socket ${socket.id} joined board ${boardId}`);

        try{
            const state = await getBoardState(boardId);
            socket.emit("BOARD_STATE", state);
        } catch (err) {
            console.error("Error fetching board state:", err);
        }
    });

    // Leave a board room — flush state to DB
    socket.on("LEAVE_BOARD", async ({boardId}) => {
        socket.leave(boardId);
        joinedBoards.delete(boardId);
        console.log(`Socket ${socket.id} left board ${boardId}`);

        // Flush this board's state to DB on leave
        await flushBoard(boardId);
    });

    // On disconnect — flush all boards this socket was in
    socket.on("disconnect", async () => {
        for (const boardId of joinedBoards) {
            await flushBoard(boardId);
        }
        joinedBoards.clear();
    });

    // Events
    handleStateUpdate(io, socket);
    handleCodeUpdate(io, socket);
    handleTextUpdate(io, socket);
}