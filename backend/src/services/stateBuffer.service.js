import redis from "../config/redis.js";
import prisma from "../config/db.js";

const REDIS_STATE_PREFIX = "board:state:";
const FLUSH_INTERVAL_MS = 5000; // Flush to DB every 5 seconds

const dirtyBoards = new Set();

/**
 * Get board state from Redis (falls back to DB)
 */
export const getBoardState = async (boardId) => {
  const cached = await redis.get(REDIS_STATE_PREFIX + boardId);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fallback to DB
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  const state = board?.state || {};

  // Warm cache
  await redis.set(REDIS_STATE_PREFIX + boardId, JSON.stringify(state), "EX", 3600);

  return state;
};

/**
 * Update board state in Redis and mark dirty for DB flush
 */
export const updateBoardState = async (boardId, state) => {
  await redis.set(REDIS_STATE_PREFIX + boardId, JSON.stringify(state), "EX", 3600);
  dirtyBoards.add(boardId);
};

/**
 * Merge partial data into existing state
 */
export const mergeBoardState = async (boardId, partial) => {
  const current = await getBoardState(boardId);
  const merged = { ...current, ...partial };
  await updateBoardState(boardId, merged);
  return merged;
};

/**
 * Flush all dirty boards from Redis to Postgres
 */
const flushToDatabase = async () => {
  if (dirtyBoards.size === 0) return;

  const boards = [...dirtyBoards];
  dirtyBoards.clear();

  for (const boardId of boards) {
    try {
      const cached = await redis.get(REDIS_STATE_PREFIX + boardId);
      if (!cached) continue;

      await prisma.board.update({
        where: { id: boardId },
        data: { state: JSON.parse(cached) },
      });
    } catch (err) {
      // Re-mark as dirty so it retries next cycle
      dirtyBoards.add(boardId);
      console.error(`Failed to flush board ${boardId}:`, err);
    }
  }
};

// Start periodic flush
setInterval(flushToDatabase, FLUSH_INTERVAL_MS);

// Flush on process exit
process.on("SIGINT", async () => {
  console.log("Flushing board states before exit...");
  await flushToDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await flushToDatabase();
  process.exit(0);
});
