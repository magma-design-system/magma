import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { magmaVendor } from './vendor.ts';
import { magmaApi } from './magma-api.ts';
import { studioFavicons } from './favicons.ts';

// the generator sources of design-tokens are .mts files imported with .mjs
// specifiers (node/tsc convention); vite needs help mapping the extension
function resolveMts(): Plugin {
  return {
    name: 'resolve-mts',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.mjs')) return null;
      const candidate = path.resolve(path.dirname(importer), source.replace(/\.mjs$/, '.mts'));
      return existsSync(candidate) ? candidate : null;
    },
  };
}

// chalk is only used by the generator for console coloring; in the browser
// bundle it is replaced by a pass-through stub
const chalkStub = fileURLToPath(new URL('./src/chalk-stub.ts', import.meta.url));

const root = fileURLToPath(new URL('.', import.meta.url));

// The tests that need no document: the engine, and the checks of the build and of the site.
// Every other `*.test.mts` runs in jsdom, so a new test is never left out of a run.
const NODE_TESTS = ['test/{bundle,gate,hue-ends,routes,share,site,vendor}.test.mts'];

export default defineConfig({
  root,
  plugins: [resolveMts(), magmaVendor(root), magmaApi(), studioFavicons()],
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
  resolve: {
    alias: {
      chalk: chalkStub,
    },
  },
  // relative asset paths: the built studio works wherever it is mounted (a
  // path of the Pages site, a command serving it inside a project), never only
  // at the root of its own origin
  base: './',
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    // the studio, and the pages it shows in an iframe: the scene and the groups of the Theme
    // section, the states of a colour beside a contrast scale, the page of a product the hero of
    // the Start page paints
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        scene: fileURLToPath(new URL('./scene.html', import.meta.url)),
        groups: fileURLToPath(new URL('./groups.html', import.meta.url)),
        states: fileURLToPath(new URL('./states.html', import.meta.url)),
        hero: fileURLToPath(new URL('./hero.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5177,
    // pin the port: if 5177 is busy it is this same studio, so fail fast
    // instead of silently moving to 5178 (which spawns confusing extra instances)
    strictPort: true,
  },
  // Three environments (#1398). `node`: the code that needs no document, and the checks of the
  // build; `jsdom`: the pages, rendered by Preact in a document whose mds-* tags never upgrade;
  // `browser`: the code that has to meet the real components (`*.e2e.mts`), in the Playwright
  // Chromium, which loads the installed magma as every page of the studio does (vendor.ts).
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'node', environment: 'node', include: NODE_TESTS },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['test/**/*.test.mts'],
          exclude: NODE_TESTS,
          // the effects of Preact after a paint, scheduled with no global of jsdom (test/setup.mts)
          setupFiles: ['test/setup.mts'],
        },
      },
      {
        extends: true,
        // prebundled before the run: a dependency found mid-run reloads the page of the test,
        // which then holds two copies of Preact (hooks of one, components of the other)
        optimizeDeps: {
          include: ['preact', 'preact/hooks', 'preact/jsx-dev-runtime', 'preact/jsx-runtime'],
        },
        test: {
          name: 'browser',
          include: ['test/**/*.e2e.mts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
            // the next free port when another run (a worktree beside this one) holds the default
            api: { port: 63315, strictPort: false },
          },
        },
      },
    ],
  },
});
