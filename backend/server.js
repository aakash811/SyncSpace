import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";
import { initSockets } from "./src/sockets/index.js";
import "./src/config/redis.js"
import "dotenv/config"

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

initSockets(io);

global.io = io;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});