/**
 * ESM + TypeScript via ts-jest. The package is `"type": "module"` and compiled
 * with NodeNext, so relative imports carry `.js` extensions in source; the
 * moduleNameMapper below strips them back to the `.ts` files at test time.
 *
 * Run with `NODE_OPTIONS=--experimental-vm-modules` (see the `test` script).
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
};
