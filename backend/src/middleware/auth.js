import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Authentication token required', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please log in again', 401);
      }
      return errorResponse(res, 'Invalid authentication token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user) {
      return errorResponse(res, 'User account no longer exists', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account has been deactivated. Contact Admin.', 403);
    }

    // Check if account is temporarily locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / (1000 * 60));
      return errorResponse(res, `Account locked due to multiple failed attempts. Try again in ${remainingMinutes} minute(s).`, 403);
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      roleId: user.roleId
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Internal authentication error', 500);
  }
};
