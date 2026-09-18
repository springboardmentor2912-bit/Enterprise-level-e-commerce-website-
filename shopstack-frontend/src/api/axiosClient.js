import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
axiosClient.interceptors.request.use(
  (config) => {
    const customerToken = localStorage.getItem('shopstack_token');
    const vendorToken = localStorage.getItem('shopstack_vendor_token');
    const token = customerToken || vendorToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch global 401 Unauthorized errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      const vendorToken = localStorage.getItem('shopstack_vendor_token');
      window.location.href = vendorToken ? '/vendor/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;