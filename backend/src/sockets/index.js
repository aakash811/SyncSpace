import { initBoardSocket } from "./board.socket.js";

export const initSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    initBoardSocket(io, socket);
  });
};