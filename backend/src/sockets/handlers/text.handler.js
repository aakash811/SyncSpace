export const handleTextEvent = (io, socket) => {
    socket.on("TEXT_EVENT", ({boardId, payload}) => {
        console.log("Text event:", payload);

        socket.to(boardId).emit("TEXT_EVENT", payload);
    })
}