import * as opportunityService from '../services/opportunityService.js';
import { validateOpportunity } from '../validators/opportunityValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getOpportunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', stage, status } = req.query;
    const result = await opportunityService.getOpportunities({
      page,
      limit,
      search,
      stage,
      status,
      user: req.user
    });

    return paginatedResponse(res, result.opportunities, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Opportunities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await opportunityService.getOpportunityById(req.params.id, req.user);
    return successResponse(res, opportunity, 'Opportunity retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const validation = validateOpportunity(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newOpportunity = await opportunityService.createOpportunity(req.body, req.user, ipAddress);

    return successResponse(res, newOpportunity, 'Opportunity created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req, res, next) => {
  try {
    const validation = validateOpportunity(req.body, true);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedOpportunity = await opportunityService.updateOpportunity(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedOpportunity, 'Opportunity updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await opportunityService.deleteOpportunity(req.params.id, req.user, ipAddress);

    return successResponse(res, null, 'Opportunity deleted successfully');
  } catch (error) {
    next(error);
  }
};
