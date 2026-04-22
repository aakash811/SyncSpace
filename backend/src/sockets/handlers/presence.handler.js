export const handleCursor = (io, socket) => {
    socket.on("CURSOR_MOVE", ({boardId, x, y, userId, name, color}) => {
        socket.to(boardId).emit("CURSOR_MOVE", {
            userId,
            name,
            color,
            x,
            y,
        });
    });
};