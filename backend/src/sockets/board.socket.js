import prisma from "../config/db.js";
import { handleStateUpdate } from "./handlers/state.handler.js";
import { handleCodeUpdate } from "./handlers/code.handler.js";
import { handleTextUpdate } from "./handlers/text.handler.js";

export const initBoardSocket = (io, socket) => {
        // Join a board room
        socket.on("JOIN_BOARD", async ({boardId}) => {
            socket.join(boardId);
            console.log(`Socket ${socket.id} joined board ${boardId}`);

        try{
            const board = await prisma.board.findUnique({
                where: {id: boardId},
            })
            
            socket.emit("BOARD_STATE", board?.state || {});
        } catch (err) {
            console.error("Error fetching board state:", err);
        }
    });

    // Leave a board room
    socket.on("LEAVE_BOARD", ({boardId}) => {
        socket.leave(boardId);
        console.log(`Socket ${socket.id} left board ${boardId}`);
    })

    // Events
    handleStateUpdate(io, socket);
    handleCodeUpdate(io, socket);
    handleTextUpdate(io, socket);
}