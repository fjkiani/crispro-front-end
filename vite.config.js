import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [
    react({
      // Suppress 'use client' directive warnings from dependencies
      babel: {
        plugins: [],
      },
    }),
  ],
  logLevel: 'warn', // Reduce build output noise
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'buffer': 'buffer',
      'path': 'path-browserify',
      '~': path.resolve(__dirname, "./src"),
      '#minpath': path.resolve(__dirname, "./node_modules/vfile/lib/minpath.js"),
      '#minproc': path.resolve(__dirname, "./node_modules/vfile/lib/minproc.js"),
      '#minurl': path.resolve(__dirname, "./node_modules/vfile/lib/minurl.js"),
      'node:url': 'url',
    },
  },
  define: {
    'global.Buffer': Buffer,
    global: "globalThis",
    "process.env": {},
  },
  base: "/",
  server: {
    // No proxy needed for standalone frontend deployment
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Suppress 'use client' directive warnings from dependencies (e.g., @radix-ui)
        if (warning.message && warning.message.includes("'use client'")) {
          return;
        }
        // Suppress 'Module level directives' warnings
        if (warning.message && warning.message.includes('Module level directives')) {
          return;
        }
        // Show all other warnings
        warn(warning);
      },
      output: {
        // Disable manual chunking to avoid circular dependency issues
        // Let Vite handle chunking automatically - it's better at preserving module order
        // This fixes "Cannot access '$d' before initialization" errors
        // The trade-off is slightly larger chunks, but better reliability
      },
    },
    // Reduce memory usage during build
    minify: 'esbuild', // Faster than terser
    target: 'es2015', // Broader compatibility, less transformation
    // Use commonjs format for better compatibility
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
});
