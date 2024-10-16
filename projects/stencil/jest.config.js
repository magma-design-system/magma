const { transform } = require('typescript');

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  preset: 'ts-jest',
  // modulePathIgnorePatterns: ["<rootDir>/src/components/*.json"],
  // moduleNameMapper: {
  //  "@maggioli-design-system/mds-table-header": "<rootDir>/scripts/test/mocks/mds-table-header/package.json"
  // },
  testMatch: ["<rootDir>/scripts/**/?(*.)+(spec|test).[jt]s"],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'scripts.tsconfig.json'}],
  }
};
