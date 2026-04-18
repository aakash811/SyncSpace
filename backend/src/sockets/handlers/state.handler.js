import prisma from "../../config/db.js";

export const handleStateUpdate = (io, socket) => {
  socket.on("STATE_UPDATE", async ({ boardId, state, userId }) => {
    try {
      //Save to DB 
      await prisma.board.update({
        where: { id: boardId },
        data: {
          state: {
            ...state,
            lastUpdatedBy: userId,
            updatedAt: new Date(),
          },
        },
      });

      //Broadcast to others
      socket.to(boardId).emit("STATE_UPDATE", state);

    } catch (err) {
      console.error("State update error:", err);
    }
  });
};