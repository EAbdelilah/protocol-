import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js', // Optional: if you need setup files
    css: true, // If you want to process CSS during tests (e.g. for CSS modules)
  },
});
