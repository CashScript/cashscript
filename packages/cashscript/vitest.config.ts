import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './test',
    testTimeout: 50000, // Set global timeout to 50 seconds
  },
});