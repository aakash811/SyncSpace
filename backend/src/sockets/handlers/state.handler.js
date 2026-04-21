import { updateBoardState } from "../../services/stateBuffer.service.js";

export const handleStateUpdate = (io, socket) => {
  socket.on("STATE_UPDATE", async ({ boardId, state, userId }) => {
    try {
      await updateBoardState(boardId, {
        ...state,
        lastUpdatedBy: userId,
        updatedAt: new Date(),
      });

      socket.to(boardId).emit("STATE_UPDATE", state);
    } catch (err) {
      console.error("State update error:", err);
    }
  });
};