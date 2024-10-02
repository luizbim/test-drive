/* eslint-disable */
export default {
  displayName: 'scheduler-service-unit-tests',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/*.(test|spec).unit.ts'],
  coverageDirectory: '../../../coverage/apps/backend/scheduler-service/unit',
};
