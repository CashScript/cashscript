import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './dist-test',
  test: {
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['json-summary'],
    },
  },
});
