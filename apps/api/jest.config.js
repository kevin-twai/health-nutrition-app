module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  // 記憶體優化設定
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
  // 減少記憶體使用
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // 設定記憶體限制
  workerIdleMemoryLimit: '512MB',
};