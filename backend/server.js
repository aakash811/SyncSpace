import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { initSockets } from "./src/sockets/index.js";
import redis from "./src/config/redis.js";
import "dotenv/config";

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Redis Pub/Sub adapter for multi-instance scaling
const pubClient = redis;
const subClient = pubClient.duplicate();

subClient.on("error", (err) => console.error("Redis sub error:", err));

io.adapter(createAdapter(pubClient, subClient));
console.log("✅ Socket.io Redis adapter attached");

initSockets(io);

global.io = io;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});