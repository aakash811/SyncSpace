import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";
import { initSockets } from "./src/sockets/index.js";
import "./src/config/redis.js"

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
initSockets(io);

global.io = io;

server.listen(5000, () => {
  console.log("Server running on port 5000");
});