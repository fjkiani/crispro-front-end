import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Minimal vitest config for v3 tumor board smoke tests.
// (Prior repo state: this file was 2 bytes of whitespace, which broke `vitest`
//  everywhere. The inline `vitest` block in package.json was being overridden
//  by the empty file. This config restores the same intent + adds `@` alias
//  parity with vite.config.js so component tests can resolve absolute imports.)
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
});
