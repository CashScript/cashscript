import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './test',
  test: {
    environment: 'node',
    reporters: ['verbose'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['json-summary'],
    },
  },
});
