import * as leadService from '../services/leadService.js';
import { validateLead, validateLeadConversion } from '../validators/leadValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status, source } = req.query;
    const result = await leadService.getLeads({
      page,
      limit,
      search,
      status,
      source,
      user: req.user
    });

    return paginatedResponse(res, result.leads, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Leads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);
    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const validation = validateLead(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newLead = await leadService.createLead(req.body, req.user, ipAddress);

    return successResponse(res, newLead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const validation = validateLead(req.body, true);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedLead = await leadService.updateLead(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedLead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await leadService.deleteLead(req.params.id, req.user, ipAddress);

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req, res, next) => {
  try {
    const validation = validateLeadConversion(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await leadService.convertLead(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, result, 'Lead converted to Customer and Opportunity successfully');
  } catch (error) {
    next(error);
  }
};
