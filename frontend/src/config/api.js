// Central place for the backend base URL.
// In production (Vercel), set VITE_API_BASE_URL to your Render backend URL,
// e.g. https://shopstack-backend.onrender.com
// Locally, it falls back to your Spring Boot dev server.
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
