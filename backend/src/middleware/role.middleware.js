import prisma from "../config/db.js";

export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const boardId = req.params.boardId || req.body.boardId;

      const membership = await prisma.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId,
            boardId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: "Not a board member" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      req.role = membership.role;

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};