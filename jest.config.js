module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/setup-jest.js'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  transformIgnorePatterns: ['/node_modules/(?!(@mui|tss-react|react-dnd|dnd-core|@react-dnd)/)'],
  testMatch: ['<rootDir>/test/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: { global: { lines: 50, statements: 50, functions: 50, branches: 50 } },
};
