import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Keep API authentication isolated per browser tab.
const appFetch = window.fetch.bind(window)

window.fetch = (input, init = {}) => {
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL ||
      'https://shopstack-backend-gjv6.onrender.com').replace(/\/$/, '')

  const requestUrl =
    typeof input === 'string'
      ? input
          .replace('http://localhost:8080', apiBaseUrl)
          .replace('https://shopstack-backend-gjv6.onrender.com', apiBaseUrl)
      : input

  const token = sessionStorage.getItem('token')

  if (!token) {
    return appFetch(requestUrl, init)
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return appFetch(requestUrl, {
    ...init,
    headers,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)