import * as reportService from '../services/reportService.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getCustomerReport = async (req, res, next) => {
  try {
    const result = await reportService.getCustomerReport({
      ...req.query,
      user: req.user
    });
    return paginatedResponse(res, result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Customer report generated');
  } catch (error) {
    next(error);
  }
};

export const getLeadReport = async (req, res, next) => {
  try {
    const result = await reportService.getLeadReport({
      ...req.query,
      user: req.user
    });
    return paginatedResponse(res, result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Lead report generated');
  } catch (error) {
    next(error);
  }
};

export const getOpportunityReport = async (req, res, next) => {
  try {
    const result = await reportService.getOpportunityReport({
      ...req.query,
      user: req.user
    });
    return paginatedResponse(res, result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Opportunity report generated');
  } catch (error) {
    next(error);
  }
};

export const getPipelineReport = async (req, res, next) => {
  try {
    const result = await reportService.getPipelineReport(req.user);
    return successResponse(res, result, 'Pipeline report generated');
  } catch (error) {
    next(error);
  }
};

export const getConversionReport = async (req, res, next) => {
  try {
    const result = await reportService.getConversionReport(req.user);
    return successResponse(res, result, 'Conversion report generated');
  } catch (error) {
    next(error);
  }
};

export const getUserActivityReport = async (req, res, next) => {
  try {
    const result = await reportService.getUserActivityReport(req.query);
    return successResponse(res, result, 'User activity report generated');
  } catch (error) {
    next(error);
  }
};

export const getAuditReport = async (req, res, next) => {
  try {
    const result = await reportService.getAuditReport(req.query);
    return paginatedResponse(res, result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Audit log report generated');
  } catch (error) {
    next(error);
  }
};
