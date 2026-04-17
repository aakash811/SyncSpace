export const initSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    require("./board.socket.js").initBoardSocket(io, socket);
  });
};