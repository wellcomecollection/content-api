import { createJsWithTsEsmPreset } from 'ts-jest';

export default {
  displayName: 'Pipeline',
  ...createJsWithTsEsmPreset(),
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!parse-duration/)'],
  // add any additional ES modules to transform, separated by pipes
};
