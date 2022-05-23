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
    '<rootDir>/packages/cashc/src/cashc-cli.ts',
    '<rootDir>/examples',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/examples',
  ],
  // TODO: This requires Jest 28, but installing Jest 28 runs into other issues
  // Fix ts-jest / ESM issues (https://stackoverflow.com/questions/66154478/jest-ts-jest-typescript-with-es-modules-import-cannot-find-module)
  // extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};
