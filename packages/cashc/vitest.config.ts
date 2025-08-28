import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './dist-test',
  test: {
    environment: 'node',
    silent: 'passed-only',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/types/**'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['json-summary'],
    },
  },
});
