import api from './api.js';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  }
};
