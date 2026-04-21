import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import boardRoutes from "./routes/board.routes.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Global API rate limit
app.use("/api", apiLimiter);

// Stricter rate limit on auth
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/test", testRoutes);
app.get("/", (req, res) => {
  res.send("SyncSpace API Running");
});

export default app;