import * as userService from '../services/userService.js';
import { validateUserCreate, validateUserUpdate, validatePasswordReset } from '../validators/userValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', roleId, isActive } = req.query;
    const result = await userService.getUsers({
      page,
      limit,
      search,
      roleId,
      isActive
    });

    return paginatedResponse(res, result.users, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await userService.getRoles();
    return successResponse(res, roles, 'Roles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const validation = validateUserCreate(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newUser = await userService.createUser(req.body, req.user, ipAddress);

    return successResponse(res, newUser, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const validation = validateUserUpdate(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await userService.toggleUserStatus(req.params.id, req.user, ipAddress);

    const msg = result.isActive ? 'User activated successfully' : 'User deactivated successfully';
    return successResponse(res, result, msg);
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const validation = validatePasswordReset(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await userService.resetUserPassword(req.params.id, req.body.newPassword, req.user, ipAddress);

    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
