export const initBoardSocket = (io, socket) => {
    // Join a board room
    socket.on("JOIN_BOARD", ({boardId}) => {
        socket.join(boardId);
        console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    // Leave a board room
    socket.on("LEAVE_BOARD", ({boardId}) => {
        socket.leave(boardId);
        console.log(`Socket ${socket.id} left board ${boardId}`);
    })

    // Events
    require("./handlers/text.handler.js").handleTextEvent(io, socket);
    require("./handlers/draw.handler.js").handleDrawEvent(io, socket);
    require("./handlers/code.handler.js").handleCodeEvent(io, socket);
}