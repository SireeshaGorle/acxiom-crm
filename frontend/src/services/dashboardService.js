import api from './api.js';

export const dashboardService = {
  getDashboardData: async () => {
    return api.get('/dashboard');
  }
};
