import prisma from "../../config/db.js";

export const handleTextUpdate = (io, socket) => {
  socket.on("TEXT_UPDATE", async ({ boardId, text }) => {
    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });

      const currentState =
        board?.state && typeof board.state === "object" ? board.state : {};

      await prisma.board.update({
        where: { id: boardId },
        data: {
          state: {
            ...currentState,
            text,
            textUpdatedAt: new Date(),
          },
        },
      });

      socket.to(boardId).emit("TEXT_UPDATE", { text });
    } catch (err) {
      console.error("Text update error:", err);
    }
  });
};
