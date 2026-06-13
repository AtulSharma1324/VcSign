import { Request, Response, NextFunction } from "express";

// ===========================
// Error Handler Middleware
// ===========================

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/** Global error handler — catches all thrown errors. */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${statusCode} — ${message}`, {
    stack: err.stack,
    code: err.code,
  });

  res.status(statusCode).json({
    error: err.code || "InternalError",
    message:
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : message,
  });
}

/** Create a typed application error. */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/** Async handler wrapper to catch promise rejections. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
