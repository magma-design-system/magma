import path from 'node:path';
import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';
import { playwright } from '@vitest/browser-playwright';

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
        // compiles the component classes imported by the unit specs: the @stencil/core runtime
        // has no decorators, and the components are not registered in mock-doc
        plugins: [stencilVitestPlugin({ css: true })],
        test: {
          name: 'spec',
          environment: 'stencil',
          include: ['src/**/*.spec.{ts,tsx}'],
        },
      },
      {
        extends: true,
        // dependencies imported by the tests from the sources, pre-bundled to avoid a reload mid-run
        optimizeDeps: { include: ['idb-keyval'] },
        test: {
          name: 'browser',
          include: ['src/**/*.e2e.{ts,tsx}'],
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
