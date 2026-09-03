import path from 'node:path';
import { defineVitestConfig } from '@stencil/vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { MIGRATED_TESTS } from './scripts/vitest-migrated.ts';

const src = (dir: string): string => path.resolve(import.meta.dirname, dir, '$1');

// @stencil/vitest does not read the tsconfig `paths`: mirror the aliases of stencil.config.ts
const alias = [
  { find: /^@common\/(.*)$/, replacement: src('src/common') },
  { find: /^@component\/(.*)$/, replacement: src('src/components') },
  { find: /^@dictionary\/(.*)$/, replacement: src('src/dictionary') },
  { find: /^@event\/(.*)$/, replacement: src('src/event-detail') },
  { find: /^@fixture\/(.*)$/, replacement: src('src/fixtures') },
  { find: /^@meta\/(.*)$/, replacement: src('src/meta') },
  { find: /^@icon\/(.*)$/, replacement: src('assets/svg') },
  { find: /^@tailwind\/(.*)$/, replacement: src('src/tailwind') },
  { find: /^@test\/(.*)$/, replacement: src('src/test') },
  { find: /^@type\/(.*)$/, replacement: src('src/type') },
];

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  resolve: { alias },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'spec',
          environment: 'stencil',
          include: MIGRATED_TESTS.filter((file) => /\.spec\.tsx?$/.test(file)),
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: MIGRATED_TESTS.filter((file) => /\.e2e\.tsx?$/.test(file)),
          setupFiles: ['./src/test/setup.ts', './src/test/setup.browser.ts'],
          restoreMocks: true,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // the Puppeteer based tests assumed a desktop frame
            viewport: { width: 1280, height: 800 },
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
