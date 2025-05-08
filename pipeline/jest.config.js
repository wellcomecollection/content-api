module.exports = {
  displayName: 'Pipeline',
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!parse-duration/)'],
};
