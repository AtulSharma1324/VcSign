import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "../utils/env";

// ===========================
// JWT Auth Middleware
// ===========================

export interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || "dev-access-secret";

/** Verify JWT access token from Authorization header. */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, getAccessSecret()) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    if ((err as jwt.TokenExpiredError).name === "TokenExpiredError") {
      res.status(401).json({
        error: "TokenExpired",
        message: "Access token has expired",
      });
      return;
    }
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid access token",
    });
  }
}

/** Generate JWT tokens. */
export function generateTokens(payload: { userId: string; email: string }) {
  const accessToken = jwt.sign(payload, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });

  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });

  return { accessToken, refreshToken };
}

/** Verify a refresh token. */
export function verifyRefreshToken(token: string): AuthPayload {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
  return jwt.verify(token, refreshSecret) as AuthPayload;
}
