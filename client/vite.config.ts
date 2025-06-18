import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://studybuddy-backend-8smv.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://studybuddy-backend-8smv.onrender.com'),
    'import.meta.env.VITE_DEEPINFRA_KEY': JSON.stringify(process.env.VITE_DEEPINFRA_KEY || 'GX6Q2IGW3tMRmL0Ej0YkgwsDMWO1cN82')
  }
});