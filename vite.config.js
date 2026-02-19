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
    target: 'es2015',
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically
        manualChunks: undefined,
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
    // No proxy — API calls use API_ROOT env var
  },

  logLevel: 'warn',
});
