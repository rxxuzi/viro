// react/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
    outDir: process.env.VITE_BUILD_OUT_DIR || 'dist', 
    emptyOutDir: true,
  },
  server: {
    port: 3000, 
  },
});
