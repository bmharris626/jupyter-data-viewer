module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.ts',
    '**/tests/**/*.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lab/**',
    '!src/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
