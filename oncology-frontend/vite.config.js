import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env,
  },
  plugins: [
    react({
      // Use the new JSX runtime (automatic)
      jsxRuntime: 'automatic',
      // Include JSX helpers in the bundle
      jsxImportSource: 'react',
    }),
  ],
  build: {
    // Ensure React JSX runtime is included
    rollupOptions: {
      output: {
        // Ensure React JSX runtime helpers are included
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Log level
  logLevel: 'warn',
});
