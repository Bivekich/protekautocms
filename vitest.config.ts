import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx}',
      '**/src/test/**/*.{test,spec}.{ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'components': path.resolve(__dirname, './components'),
      'src': path.resolve(__dirname, './src'),
    },
  },
}); 