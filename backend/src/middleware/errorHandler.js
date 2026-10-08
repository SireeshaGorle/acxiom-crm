import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, 409);
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found.', 404);
  }

  // Prisma foreign key constraint failed (P2003)
  if (err.code === 'P2003') {
    return errorResponse(res, 'Referenced record does not exist or cannot be modified.', 400);
  }

  // Default server error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(res, message, statusCode, err.errors || null);
};
