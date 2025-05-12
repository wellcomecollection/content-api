const { createJsWithTsEsmPreset } = require('ts-jest');

module.exports = {
  displayName: 'Pipeline',
  ...createJsWithTsEsmPreset(),
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!parse-duration/)'],
  // add any additional ES modules to transform, separated by pipes
};
