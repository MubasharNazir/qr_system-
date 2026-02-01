/**
 * Axios instance for API calls.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    // Add admin token if available (for admin routes)
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      // Always set Authorization header, even if already present (to ensure it's correct)
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle 401 (unauthorized) - redirect to login
    if (error.response?.status === 401 && error.config?.url?.includes('/admin')) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    
    console.error('[API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
