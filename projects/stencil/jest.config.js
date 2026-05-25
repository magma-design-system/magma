/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  preset: 'ts-jest',
  testMatch: ["<rootDir>/scripts/**/?(*.)+(spec|test).[jt]s"],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'script.tsconfig.json'}],
  }
};
