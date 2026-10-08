import api from './api.js';

export const customerService = {
  getCustomers: async (params = {}) => {
    return api.get('/customers', { params });
  },

  getCustomerById: async (id) => {
    return api.get(`/customers/${id}`);
  },

  createCustomer: async (data) => {
    return api.post('/customers', data);
  },

  updateCustomer: async (id, data) => {
    return api.put(`/customers/${id}`, data);
  },

  deleteCustomer: async (id) => {
    return api.delete(`/customers/${id}`);
  }
};
