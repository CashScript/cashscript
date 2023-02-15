export default {
  transform: {},
  roots: ['./dist-test'],
  reporters: [
    '../../jest/log-on-fail-reporter.cjs',
    '../../jest/summary-reporter.cjs',
  ],
  testEnvironment: 'jest-environment-node',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
