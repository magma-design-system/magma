module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@adobe/leonardo-contrast-colors|apca-w3|colorparsley)'],
  testRegex: [
    '([a-z/.]{1,}).test.ts$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@/formats/(.*)': '<rootDir>formats/$1',
  },
}
