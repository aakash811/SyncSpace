import { initBoardSocket } from "./board.socket.js";
import jwt from "jsonwebtoken";

export const initSockets = (io) => {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id, "userId:", socket.user.userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    initBoardSocket(io, socket);
  });
};