import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  cacheDir: '.vite-cache',

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  server: {
    allowedHosts: true,

  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    // Target modern browsers — smaller output, no legacy polyfills
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],

    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Core React runtime — always needed, never changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management — tiny, always needed
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Charts — heavy (535KB), only used on dashboard/usage pages
          'vendor-charts': ['apexcharts', 'react-apexcharts'],
          // Utility libs — frequently used, stable cache target
          'vendor-utils': ['dayjs', 'axios', 'dompurify', 'crypto-js'],
          // NOTE: @mui/material intentionally NOT here — let Rollup tree-shake
          // per-page so login only loads ~150KB instead of the full 400KB MUI
        },
      },
    },
  },

  base: '/',
});
