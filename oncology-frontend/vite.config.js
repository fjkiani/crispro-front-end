import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      external: [],
    },
  },
});
