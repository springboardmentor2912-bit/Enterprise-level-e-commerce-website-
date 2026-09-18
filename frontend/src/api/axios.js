import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // Default to relative /api when not explicitly configured or set to /api
  if (!url || url.trim() === '' || url.trim() === '/api') {
    return '/api';
  }

  url = url.trim().replace(/\/+$/, '');

  // If accessed from a remote device/mobile phone on the local network (e.g. 192.168.x.x or custom host)
  // and url contains localhost or 127.0.0.1, dynamic rewrite to the browser's hostname
  // so mobile devices reach the host machine running the backend rather than the mobile device itself.
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname;
    const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';

    if (!isLocalhost && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      url = url.replace(/localhost/g, currentHost).replace(/127\.0\.0\.1/g, currentHost);
    }
  }

  if ((url.startsWith('http://') || url.startsWith('https://')) && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor to add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopstack_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to extract user-friendly error messages
export const getErrorMessage = (
  error,
  defaultMsg = 'An unexpected error occurred. Please try again.'
) => {
  if (!error) return defaultMsg;

  if (typeof error === 'string') return error;

  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
      const errList = Object.entries(data.fieldErrors).map(
        ([field, msg]) => `${msg}`
      );

      if (errList.length > 0) {
        return errList.join(' • ');
      }
    }

    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  if (error.message) {
    if (
      error.message.includes('Network Error') ||
      error.message.includes('ECONNREFUSED')
    ) {
      return 'Unable to reach backend server. Please try again.';
    }

    if (error.message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    return error.message;
  }

  return defaultMsg;
};

// Interceptor to handle global 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/login' ||
        window.location.pathname === '/register');

    if (error.response && error.response.status === 401) {
      if (!isAuthEndpoint && !isAuthPage) {
        localStorage.removeItem('shopstack_token');
        localStorage.removeItem('shopstack_user');
        window.location.href = '/login?session_expired=true';
      }
    }

    if (!error.response) {
      error.message = 'Unable to reach backend server. Please try again.';
    } else if (
      error.response.status === 500 &&
      (!error.response.data ||
        typeof error.response.data === 'string' ||
        !error.response.data.message)
    ) {
      error.message = 'Backend service connection failed. Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;