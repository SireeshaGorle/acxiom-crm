import api from './api.js';

export const followUpService = {
  getFollowUps: async (params = {}) => {
    return api.get('/followups', { params });
  },

  getFollowUpById: async (id) => {
    return api.get(`/followups/${id}`);
  },

  createFollowUp: async (data) => {
    return api.post('/followups', data);
  },

  updateFollowUp: async (id, data) => {
    return api.put(`/followups/${id}`, data);
  },

  deleteFollowUp: async (id) => {
    return api.delete(`/followups/${id}`);
  }
};
