import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './test',
  test: {
    environment: 'node',
    silent: 'passed-only',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['json-summary'],
    },
  },
});
