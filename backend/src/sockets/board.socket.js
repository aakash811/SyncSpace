import { getBoardState, flushBoard } from "../services/stateBuffer.service.js";
import { handleStateUpdate } from "./handlers/state.handler.js";
import { handleCodeUpdate } from "./handlers/code.handler.js";
import { handleTextUpdate } from "./handlers/text.handler.js";
import prisma from "../config/db.js";

const boardUsers = new Map();
const uniqueUsersMap = new Map();
export const initBoardSocket = (io, socket) => {

        // Track which boards this socket is in
        const joinedBoards = new Set();

        // Join a board room
        socket.on("JOIN_BOARD", async ({boardId, userId}) => {
            socket.join(boardId);

            if(!boardUsers.has(boardId)){
                boardUsers.set(boardId, []);
            }

            const users = boardUsers.get(boardId);
            const exists = users.find((user) => user.socketId === socket.id);

            if(!exists){
                const user = await prisma.user.findUnique({
                    where: {id: userId},
                    select: {id: true, name: true},
                });

                users.push({
                    userId: user.id,
                    name: user.name,
                    socketId: socket.id
                });
            }
            
            users.forEach((user) => {
                uniqueUsersMap.set(user.userId, user);
            });

            const uniqueUsers = Array.from(uniqueUsersMap.values());

            io.to(boardId).emit("ACTIVE_USERS",
                uniqueUsers.map((user) => ({
                    userId: user.userId,
                    name: user.name,
                }))
            );
            
            socket.to(boardId).emit("USER_JOINED", {userId});

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
        boardUsers.forEach((users, boardId) => {
            const updated = users.filter(u => u.socketId != socket.id);

            boardUsers.set(boardId, updated);

            io.to(boardId).emit(
                "ACTIVE_USERS", 
                updated.map((user) => ({userId: user.userId}))
            );

            io.to(boardId).emit("USER_LEFT");
        })
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