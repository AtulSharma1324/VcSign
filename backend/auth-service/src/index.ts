import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "../../shared/src/middleware/errorHandler";

dotenv.config({ path: "../../.env" });

// ===========================
// Auth Service
// ===========================

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  credentials: true
}));
app.use(morgan("short"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});
app.get("/", (_req, res) => {
  res.send("Auth Service OK");
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`);
});

export default app;
