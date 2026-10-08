import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to add JWT Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acxiom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling global authentication / authorization errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Auto logout on 401 Unauthorized (token expired / invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('acxiom_token');
      localStorage.removeItem('acxiom_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: error.response?.data?.errors || null
    });
  }
);

export default api;
