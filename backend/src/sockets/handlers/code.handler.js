export const handleCodeEvent = (io, socket) => {
    socket.on("CODE_EVENT", ({boardId, payload}) => {
        console.log("Code event:", payload);

        socket.to(boardId).emit("CODE_EVENT", payload);
    })
}