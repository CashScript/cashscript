import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './dist-test',
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/types/**'],
    testTimeout: 50000,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
    },
  },
});
