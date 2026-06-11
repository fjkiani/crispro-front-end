import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Merged config: Vite 5 (oncology-frontend) + production hardening (root)
export default defineConfig({
  plugins: [
    react({
      // Use the new JSX runtime (automatic)
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
  ],

  // Path aliases (@ and ~ both resolve to ./src)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
      'buffer': 'buffer',
      'path': 'path-browserify',
      'node:url': 'url',
    },
  },

  // Global defines for Node.js compat
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },

  base: '/',

  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2015',
    rollupOptions: {
      output: {
        /**
         * Route-level code splitting.
         *
         * Strategy: isolate the heaviest, most cache-stable vendor groups.
         * Rollup handles app-code splitting automatically via dynamic import()
         * boundaries in the route files.
         *
         * NOTE: We do NOT split 'deps' into a separate chunk — that caused
         * circular chunk warnings because many node_modules cross-import each
         * other. Instead we let Rollup auto-chunk everything not explicitly
         * named here.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return; // app code: let Rollup decide

          // React core — always in initial bundle, tiny, cache-stable
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/react-router/')
          ) {
            return 'vendor-react';
          }

          // MUI + Emotion — large, rarely changes, safe to isolate
          if (
            id.includes('/node_modules/@mui/') ||
            id.includes('/node_modules/@emotion/')
          ) {
            return 'vendor-mui';
          }

          // Charting — only loaded on data pages
          if (
            id.includes('/node_modules/recharts') ||
            id.includes('/node_modules/@mui/x-charts')
          ) {
            return 'vendor-charts';
          }

          // PDF renderer — very heavy, only on export flows
          if (id.includes('/node_modules/@react-pdf')) {
            return 'vendor-pdf';
          }

          // Everything else in node_modules: let Rollup auto-chunk
          // (avoids circular chunk warnings from cross-importing deps)
        },
      },
      onwarn(warning, warn) {
        // Suppress 'use client' directive warnings from dependencies
        if (warning.message && warning.message.includes("'use client'")) {
          return;
        }
        // Suppress 'Module level directives' warnings
        if (warning.message && warning.message.includes('Module level directives')) {
          return;
        }
        warn(warning);
      },
    },
    // CommonJS compatibility for mixed ESM/CJS deps
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },

  server: {
    port: 5173,
    // Proxy all /api/* requests to the FastAPI backend running on 8000.
    // Without this, fetch('/api/...') hits Vite (port 5173) and returns 404.
    // This is the development-only fix — production uses the actual backend URL.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
    },
  },

  logLevel: 'warn',
});
