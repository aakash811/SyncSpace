import express from "express";
import { 
    createBoard, 
    getBoards, 
    getBoardById, 
    deleteBoard, 
    joinBoard, 
    updateBoardState 
} from "../controllers/board.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getBoards);
router.get("/:boardId", authMiddleware, requireRole(["OWNER", "EDITOR", "VIEWER"]), getBoardById);
router.delete("/:boardId", authMiddleware, requireRole(["OWNER"]), deleteBoard);
router.post("/:boardId/join", authMiddleware, joinBoard);
router.patch("/:boardId/state", authMiddleware, requireRole(["OWNER", "EDITOR"]), updateBoardState);


export default router;