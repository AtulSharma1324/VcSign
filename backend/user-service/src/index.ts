import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 4002;

app.use(helmet());
app.use(cors({ origin: process.env.APP_URL || "http://localhost:3000", credentials: true }));
app.use(morgan("short"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

app.get("/api/users/me", (req, res) => {
  // Dummy endpoint for now
  res.json({ id: "dummy-id", displayName: "User" });
});

app.listen(PORT, () => {
  console.log(`[User Service] Running on port ${PORT}`);
});

export default app;
