export default {
  transform: {},
  roots: ['./dist-test'],
  reporters: [
    '../../jest/log-on-fail-reporter.js',
    '../../jest/summary-reporter.js',
  ],
  testEnvironment: 'jest-environment-node',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
