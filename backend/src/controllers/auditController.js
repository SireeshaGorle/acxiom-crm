import * as reportService from '../services/reportService.js';
import { paginatedResponse } from '../utils/apiResponse.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, userEmail, action, entity, startDate, endDate } = req.query;
    const result = await reportService.getAuditReport({
      page,
      limit,
      search,
      userEmail,
      action,
      entity,
      startDate,
      endDate
    });

    return paginatedResponse(res, result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};
