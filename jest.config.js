module.exports = {
  preset: 'ts-jest',
  testEnvironment: './jest/custom-environment',
  verbose: false,
  reporters: [
    './jest/log-on-fail-reporter.js',
    './jest/summary-reporter.js',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/cashc/src/grammar/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/examples',
  ]
};
