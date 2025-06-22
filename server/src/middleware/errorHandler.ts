import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

export class AppError extends Error {
  constructor(message: string, status: number) {
    super(message); // Call the parent Error constructor
    this.status = status;
    this.name = 'AppError'; // Set the name property for better identification
    // Optional: Capture stack trace for better debugging in V8-based environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}