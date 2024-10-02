/* eslint-disable */
export default {
  displayName: 'scheduler-service-integration-tests',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/*.(test|spec).integration.ts'],
  coverageDirectory: '../../../coverage/apps/backend/scheduler-service',
};
