import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || process.env.USER_SERVICE_PORT || 4002;

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan("short"));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service" });
});
app.get("/", (_req, res) => {
  res.send("User Service OK");
});

app.get("/api/users/me", (req, res) => {
  // Dummy endpoint for now
  res.json({ id: "dummy-id", displayName: "User" });
});

app.listen(PORT, () => {
  console.log(`[User Service] Running on port ${PORT}`);
});

export default app;
