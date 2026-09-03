/**
 * TEMPORARY (#662): test files already migrated to @stencil/vitest.
 * Jest ignores them (stencil.config.ts) and Vitest runs them (vitest.config.ts).
 * Removed once the whole suite runs on Vitest.
 */
export const MIGRATED_TESTS: string[] = ['src/components/mds-zero/test/mds-zero.e2e.ts'];
