module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    // '\\.[jt]sx?$': 'babel-jest',
  },
  // transformIgnorePatterns: ['node_modules/(?!@adobe/leonardo-contrast-colors|apca-w3|colorparsley)'],
  testRegex: [
    '([a-z/.]{1,}).test.mts$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs', 'mts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
    '@/formats/(.*)': '<rootDir>formats/$1',
  },
}
