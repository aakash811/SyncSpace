export const handleDrawEvent = (io, socket) => {
    socket.on("DRAW_EVENT", ({boardId, payload}) => {
        console.log("Draw event:", payload);

        socket.to(boardId).emit("DRAW_EVENT", payload);
    })
}