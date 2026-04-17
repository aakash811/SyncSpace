import { 
    createBoardService, 
    getUserBoardsService, 
    getBoardByIdService, 
    deleteBoardService, 
    joinBoardService, 
    updateBoardStateService 
} from "../services/board.service.js";

export const createBoard = async (req, res) => {
  try {
    const board = await createBoardService({
      title: req.body.title,
      userId: req.user.userId,
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await getUserBoardsService(req.user.userId);
    res.json(boards);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const board = await getBoardByIdService(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    await deleteBoardService(req.params.boardId);

    res.json({ message: "Board deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinBoard = async (req, res) => {
  try {
    const board = await joinBoardService({
      boardId: req.params.boardId,
      userId: req.user.userId, 
    });

    console.log("JOIN USER:", req.user);

    res.json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBoardState = async (req, res) => {
  try {
    const board = await updateBoardStateService({
      boardId: req.params.boardId,
      state: req.body.state,
    });

    res.json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};