import api from './api.js';

export const leadService = {
  getLeads: async (params = {}) => {
    return api.get('/leads', { params });
  },

  getLeadById: async (id) => {
    return api.get(`/leads/${id}`);
  },

  createLead: async (data) => {
    return api.post('/leads', data);
  },

  updateLead: async (id, data) => {
    return api.put(`/leads/${id}`, data);
  },

  deleteLead: async (id) => {
    return api.delete(`/leads/${id}`);
  },

  convertLead: async (id, conversionData) => {
    return api.post(`/leads/${id}/convert`, conversionData);
  }
};
