import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Route all API requests through Vite dev server proxy so mobile and desktop work identically
// and attach JWT Authorization header automatically
axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://localhost:8080')) {
      config.url = config.url.replace('http://localhost:8080', '');
    } else if (config.url.startsWith('http://127.0.0.1:8080')) {
      config.url = config.url.replace('http://127.0.0.1:8080', '');
    }
  }

  try {
    const savedUser = sessionStorage.getItem('shopstack_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }

  return config;
});

// Response interceptor to handle expired JWT tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthPath = error.config && error.config.url && error.config.url.includes('/api/auth/');
      if (!isAuthPath) {
        sessionStorage.removeItem('shopstack_user');
        sessionStorage.removeItem('shopstack_cart');
        sessionStorage.removeItem('shopstack_orders');
        // If not already on auth page, reload to reset state
        if (!window.location.hash.includes('login') && !window.location.pathname.includes('login')) {
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
