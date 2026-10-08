import api from './api.js';

export const userService = {
  getUsers: async (params = {}) => {
    return api.get('/users', { params });
  },

  getRoles: async () => {
    return api.get('/users/roles');
  },

  getUserById: async (id) => {
    return api.get(`/users/${id}`);
  },

  createUser: async (data) => {
    return api.post('/users', data);
  },

  updateUser: async (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  toggleUserStatus: async (id) => {
    return api.patch(`/users/${id}/toggle-status`);
  },

  resetUserPassword: async (id, newPassword) => {
    return api.post(`/users/${id}/reset-password`, { newPassword });
  }
};
