import { errorResponse } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'MANAGER', 'SALES_EXECUTIVE'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of following roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Helper to check if user has access to resource based on role & assignment
 * Admin -> unrestricted
 * Manager -> team/all view
 * Sales Executive -> assigned records or created records
 */
export const buildRoleBasedWhereClause = (user, existingWhere = {}) => {
  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    return existingWhere;
  }

  // For SALES_EXECUTIVE: only see records assigned to them or created by them
  return {
    ...existingWhere,
    OR: [
      { assignedToId: user.id },
      { createdById: user.id }
    ]
  };
};
