import api from './api.js';

export const opportunityService = {
  getOpportunities: async (params = {}) => {
    return api.get('/opportunities', { params });
  },

  getOpportunityById: async (id) => {
    return api.get(`/opportunities/${id}`);
  },

  createOpportunity: async (data) => {
    return api.post('/opportunities', data);
  },

  updateOpportunity: async (id, data) => {
    return api.put(`/opportunities/${id}`, data);
  },

  deleteOpportunity: async (id) => {
    return api.delete(`/opportunities/${id}`);
  }
};
