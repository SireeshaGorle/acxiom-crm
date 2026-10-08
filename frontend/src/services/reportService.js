import api from './api.js';

export const reportService = {
  getCustomerReport: async (params = {}) => {
    return api.get('/reports/customers', { params });
  },

  getLeadReport: async (params = {}) => {
    return api.get('/reports/leads', { params });
  },

  getOpportunityReport: async (params = {}) => {
    return api.get('/reports/opportunities', { params });
  },

  getPipelineReport: async () => {
    return api.get('/reports/pipeline');
  },

  getConversionReport: async () => {
    return api.get('/reports/conversion');
  },

  getUserActivityReport: async (params = {}) => {
    return api.get('/reports/user-activity', { params });
  },

  getAuditReport: async (params = {}) => {
    return api.get('/reports/audit', { params });
  }
};
