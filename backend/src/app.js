import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import boardRoutes from "./routes/board.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/test", testRoutes);
app.get("/", (req, res) => {
  res.send("SyncSpace API Running");
});

export default app;