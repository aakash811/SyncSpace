import { initBoardSocket } from "./board.socket.js";
import jwt from "jsonwebtoken";
import { createSocketRateLimiter } from "../middleware/socketRateLimit.middleware.js";

const rateLimiter = createSocketRateLimiter({ maxEvents: 60, windowMs: 1000 });

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

    // Apply rate limiter to all incoming events
    socket.use((packet, next) => {
      rateLimiter(socket, next);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    initBoardSocket(io, socket);
  });
};