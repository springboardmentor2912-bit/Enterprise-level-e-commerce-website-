import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',   // Exposes server to host machine outside Docker
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173 // Maps Hot Module Replacement (HMR) for CSS live-reloading
    }
  }
});