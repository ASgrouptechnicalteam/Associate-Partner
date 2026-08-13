import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In dev, proxy API calls to the local Express backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
