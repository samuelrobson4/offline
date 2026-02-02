import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiError } from '../types';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  _req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error('Error occurred:', err);

  if ('statusCode' in err) {
    const apiErr = err as ApiError;
    return res.status(apiErr.statusCode).json({
      error: apiErr.message,
      statusCode: apiErr.statusCode,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
};
