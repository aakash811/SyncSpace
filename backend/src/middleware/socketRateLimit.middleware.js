/**
 * Socket-level rate limiter using a sliding window per user.
 * Rejects events exceeding the limit and logs violations.
 */

const userEventCounts = new Map(); // userId -> { count, resetAt }

const DEFAULT_MAX_EVENTS = 60;    // per window
const DEFAULT_WINDOW_MS = 1000;   // 1 second window

/**
 * Middleware factory for socket event rate limiting.
 * Wraps a socket handler — if the user exceeds the limit, the event is dropped.
 */
export const createSocketRateLimiter = ({
  maxEvents = DEFAULT_MAX_EVENTS,
  windowMs = DEFAULT_WINDOW_MS,
} = {}) => {
  return (socket, next) => {
    const userId = socket.user?.userId || socket.id;
    const now = Date.now();

    let bucket = userEventCounts.get(userId);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      userEventCounts.set(userId, bucket);
    }

    bucket.count++;

    if (bucket.count > maxEvents) {
      console.warn(
        `⚠️ Rate limit exceeded: user ${userId} (${bucket.count}/${maxEvents} events in ${windowMs}ms)`
      );
      socket.emit("RATE_LIMITED", {
        message: "Too many events. Please slow down.",
      });
      return; // Drop the event
    }

    next();
  };
};

// Cleanup stale entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [userId, bucket] of userEventCounts.entries()) {
    if (now > bucket.resetAt) {
      userEventCounts.delete(userId);
    }
  }
}, 30000);
