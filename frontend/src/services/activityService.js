import api from './api.js';

export const activityService = {
  getActivities: async (params = {}) => {
    return api.get('/activities', { params });
  },

  createActivity: async (data) => {
    return api.post('/activities', data);
  },

  updateActivity: async (id, data) => {
    return api.put(`/activities/${id}`, data);
  },

  deleteActivity: async (id) => {
    return api.delete(`/activities/${id}`);
  }
};
