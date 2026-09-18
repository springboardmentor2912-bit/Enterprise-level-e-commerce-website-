import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Route all API requests through Vite dev server proxy so mobile and desktop work identically
axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://localhost:8080')) {
      config.url = config.url.replace('http://localhost:8080', '');
    } else if (config.url.startsWith('http://127.0.0.1:8080')) {
      config.url = config.url.replace('http://127.0.0.1:8080', '');
    }
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
