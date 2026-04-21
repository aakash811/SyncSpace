import { mergeBoardState } from "../../services/stateBuffer.service.js";

export const handleTextUpdate = (io, socket) => {
  socket.on("TEXT_UPDATE", async ({ boardId, text }) => {
    try {
      await mergeBoardState(boardId, {
        text,
        textUpdatedAt: new Date(),
      });

      socket.to(boardId).emit("TEXT_UPDATE", { text });
    } catch (err) {
      console.error("Text update error:", err);
    }
  });
};
