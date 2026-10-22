import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../core/constants/Status_code.js';
import { logger } from '../core/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || (err as any).status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Đã xảy ra lỗi nội bộ máy chủ';

  if (statusCode >= 500) {
    logger.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`, err);
  } else {
    logger.warn(`[CLIENT WARNING] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
