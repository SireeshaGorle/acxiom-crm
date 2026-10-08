import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardAnalytics(req.user);
    return successResponse(res, data, 'Dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
};
