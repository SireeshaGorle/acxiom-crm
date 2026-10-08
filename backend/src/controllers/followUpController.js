import * as followUpService from '../services/followUpService.js';
import { validateFollowUp } from '../validators/followUpValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getFollowUps = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status, type, filterTime } = req.query;
    const result = await followUpService.getFollowUps({
      page,
      limit,
      search,
      status,
      type,
      filterTime,
      user: req.user
    });

    return paginatedResponse(res, result.followUps, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Follow-ups retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFollowUpById = async (req, res, next) => {
  try {
    const followUp = await followUpService.getFollowUpById(req.params.id, req.user);
    return successResponse(res, followUp, 'Follow-up retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createFollowUp = async (req, res, next) => {
  try {
    const validation = validateFollowUp(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newFollowUp = await followUpService.createFollowUp(req.body, req.user, ipAddress);

    return successResponse(res, newFollowUp, 'Follow-up scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateFollowUp = async (req, res, next) => {
  try {
    const validation = validateFollowUp(req.body, true);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedFollowUp = await followUpService.updateFollowUp(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedFollowUp, 'Follow-up updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteFollowUp = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await followUpService.deleteFollowUp(req.params.id, req.user, ipAddress);

    return successResponse(res, null, 'Follow-up deleted successfully');
  } catch (error) {
    next(error);
  }
};
