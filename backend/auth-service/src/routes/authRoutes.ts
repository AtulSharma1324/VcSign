import { Router } from "express";
import { AuthController } from "../controllers/authController";

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);
authRoutes.post("/refresh", controller.refresh);
authRoutes.post("/logout", controller.logout);

// OAuth Routes
authRoutes.get("/oauth/google", controller.googleAuthRedirect);
authRoutes.get("/oauth/google/callback", controller.googleAuthCallback);
