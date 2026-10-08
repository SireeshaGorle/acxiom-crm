import * as activityService from '../services/activityService.js';
import { validateActivity } from '../validators/activityValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', type, status } = req.query;
    const result = await activityService.getActivities({
      page,
      limit,
      search,
      type,
      status,
      user: req.user
    });

    return paginatedResponse(res, result.activities, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Activities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const validation = validateActivity(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newActivity = await activityService.createActivity(req.body, req.user, ipAddress);

    return successResponse(res, newActivity, 'Activity logged successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const validation = validateActivity(req.body, true);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedActivity = await activityService.updateActivity(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedActivity, 'Activity updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await activityService.deleteActivity(req.params.id, req.user, ipAddress);

    return successResponse(res, null, 'Activity deleted successfully');
  } catch (error) {
    next(error);
  }
};
