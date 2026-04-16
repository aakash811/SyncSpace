import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

server.listen(5000, () => {
  console.log("Server running on port 5000");
});