import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './test',
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/types/**'],
    testTimeout: 50000,
    globals: true,
    silent: 'passed-only',
    coverage: {
      provider: 'v8',
    },
  },
});
