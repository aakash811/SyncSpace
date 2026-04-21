import { mergeBoardState } from "../../services/stateBuffer.service.js";

export const handleCodeUpdate = (io, socket) => {
  socket.on("CODE_UPDATE", async ({ boardId, code, language }) => {
    try {
      await mergeBoardState(boardId, {
        code,
        language,
        codeUpdatedAt: new Date(),
      });

      socket.to(boardId).emit("CODE_UPDATE", { code, language });
    } catch (err) {
      console.error("Code update error:", err);
    }
  });
};
