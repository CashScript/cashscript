import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './test',
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 50000,
    silent: 'passed-only',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['json-summary'],
    },
  },
});
