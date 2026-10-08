import api from './api.js';

export const auditService = {
  getAuditLogs: async (params = {}) => {
    return api.get('/audit-logs', { params });
  }
};
