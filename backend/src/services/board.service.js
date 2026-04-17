import prisma from "../config/db.js";

export const createBoardService = async ({ title, userId }) => {
  const board = await prisma.board.create({
    data: {
      title,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: true,
    },
  });

  return board;
};

export const getUserBoardsService = async (userId) => {
  return prisma.board.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: true,
    },
  });
};

export const getBoardByIdService = async (boardId) => {
  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: true,
    },
  });
};

export const deleteBoardService = async (boardId) => {
  return prisma.board.delete({
    where: { id: boardId },
  });
};

export const joinBoardService = async ({ boardId, userId }) => {
    const existing = await prisma.boardMember.findUnique({
        where: {
            userId_boardId: {
                userId,
                boardId,
            },
        }
    })

    if(existing){
        return existing;
    }
    
    return prisma.boardMember.create({
        data: {
        boardId,
        userId,
        role: "VIEWER", // default
        },
    });
};

export const updateBoardStateService = async ({ boardId, state }) => {
  return prisma.board.update({
    where: { id: boardId },
    data: {
      state,
    },
  });
};