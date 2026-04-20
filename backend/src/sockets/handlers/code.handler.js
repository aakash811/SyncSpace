import prisma from "../../config/db.js";

export const handleCodeUpdate = (io, socket) => {
  socket.on("CODE_UPDATE", async ({ boardId, code, language }) => {
    try {
      // Get current state and merge code into it
      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });

      const currentState = (board?.state && typeof board.state === "object") ? board.state : {};

      await prisma.board.update({
        where: { id: boardId },
        data: {
          state: {
            ...currentState,
            code,
            language,
            codeUpdatedAt: new Date(),
          },
        },
      });

      // Broadcast to others in the room
      socket.to(boardId).emit("CODE_UPDATE", { code, language });
    } catch (err) {
      console.error("Code update error:", err);
    }
  });
};
