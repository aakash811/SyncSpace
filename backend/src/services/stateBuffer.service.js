import redis from "../config/redis.js";
import prisma from "../config/db.js";

const REDIS_STATE_PREFIX = "board:state:";
const FLUSH_INTERVAL_MS = 5000;      // Periodic flush every 5 seconds
const INACTIVITY_FLUSH_MS = 3000;    // Flush to DB 3s after last activity

const dirtyBoards = new Set();
const inactivityTimers = new Map();  // boardId -> timeout

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
 * Update board state in Redis, mark dirty, and schedule inactivity flush
 */
export const updateBoardState = async (boardId, state) => {
  await redis.set(REDIS_STATE_PREFIX + boardId, JSON.stringify(state), "EX", 3600);
  dirtyBoards.add(boardId);
  scheduleInactivityFlush(boardId);
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
 * Flush a single board from Redis to Postgres
 */
export const flushBoard = async (boardId) => {
  try {
    const cached = await redis.get(REDIS_STATE_PREFIX + boardId);
    if (!cached) return;

    await prisma.board.update({
      where: { id: boardId },
      data: { state: JSON.parse(cached) },
    });

    dirtyBoards.delete(boardId);
  } catch (err) {
    console.error(`Failed to flush board ${boardId}:`, err);
  }
};

/**
 * Schedule a flush after inactivity (debounced per board)
 */
const scheduleInactivityFlush = (boardId) => {
  const existing = inactivityTimers.get(boardId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    inactivityTimers.delete(boardId);
    if (dirtyBoards.has(boardId)) {
      await flushBoard(boardId);
    }
  }, INACTIVITY_FLUSH_MS);

  inactivityTimers.set(boardId, timer);
};

/**
 * Flush all dirty boards from Redis to Postgres (batched)
 */
const flushToDatabase = async () => {
  if (dirtyBoards.size === 0) return;

  const boards = [...dirtyBoards];
  dirtyBoards.clear();

  // Batch: flush up to 10 boards in parallel
  const BATCH_SIZE = 10;
  for (let i = 0; i < boards.length; i += BATCH_SIZE) {
    const batch = boards.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (boardId) => {
        try {
          const cached = await redis.get(REDIS_STATE_PREFIX + boardId);
          if (!cached) return;

          await prisma.board.update({
            where: { id: boardId },
            data: { state: JSON.parse(cached) },
          });
        } catch (err) {
          dirtyBoards.add(boardId);
          console.error(`Failed to flush board ${boardId}:`, err);
        }
      })
    );
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
