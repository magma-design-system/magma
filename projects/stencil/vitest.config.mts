import path from 'node:path';
import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';
import type { BrowserCommand } from 'vitest/node';

const src = (dir: string): string => path.resolve(import.meta.dirname, dir, '$1');

// the server half of the SSR tests (src/test/ssr.ts): renders the markup in Node with the hydrate
// build, as an SSR consumer does, for the browser to parse and the prebuilt components to hydrate
const renderToString: BrowserCommand<[html: string]> = async (_context, html) => {
  const hydrate = await import(path.resolve(import.meta.dirname, 'dist/hydrate/index.mjs'));
  const { html: markup, diagnostics } = await hydrate.renderToString(html, {
    fullDocument: false,
    serializeShadowRoot: 'declarative-shadow-dom',
  });
  return { html: markup, diagnostics };
};

// the Node half of the dark: variant test (src/test/dark-variant.e2e.ts): compiles a sheet with
// the Tailwind PostCSS plugin Storybook builds with, its imports resolved from src/test
const compileTailwind: BrowserCommand<[css: string]> = async (_context, css) => {
  const { css: compiled } = await postcss([tailwindcss()]).process(css, {
    from: path.resolve(import.meta.dirname, 'src/test/tailwind.css'),
  });
  return compiled;
};

// the OS colour scheme the page sees (prefers-color-scheme), null back to the browser's own
const emulateColorScheme: BrowserCommand<[scheme: 'light' | 'dark' | null]> = async (
  context,
  scheme,
) => {
  await context.page.emulateMedia({ colorScheme: scheme });
};

// the OS motion preference the page sees (prefers-reduced-motion), null back to the browser's own
const emulateReducedMotion: BrowserCommand<[motion: 'reduce' | 'no-preference' | null]> = async (
  context,
  motion,
) => {
  await context.page.emulateMedia({ reducedMotion: motion });
};

// a pointer that cannot hover, a finger's, as the page sees it ((hover: none)), false back to the
// mouse of the desktop frame. The emulateMedia of Playwright has no hover feature: the touch
// emulation of Chromium, through the DevTools protocol, sets it with the pointer. The emulation
// lasts as long as the session that set it, so each page keeps one
type DevToolsSession = { send: (method: string, params: object) => Promise<unknown> };
const touchSessions = new WeakMap<object, DevToolsSession>();
const emulateTouch: BrowserCommand<[touch: boolean]> = async (context, touch) => {
  const { page } = context;
  let session = touchSessions.get(page);
  if (!session) {
    session = await page.context().newCDPSession(page);
    touchSessions.set(page, session);
  }
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: touch });
};

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
        // the build scripts' pure helpers (scripts/*.ts), plain Node: no component, no DOM
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/*.spec.ts'],
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
            commands: {
              renderToString,
              compileTailwind,
              emulateColorScheme,
              emulateReducedMotion,
              emulateTouch,
            },
          },
        },
      },
      {
        extends: true,
        // the stories: play functions and the a11y addon checks over the whole catalogue.
        // Story globs, aliases and PostCSS come from .storybook/main.mjs (viteFinal)
        // the preview themes the docs chrome: pre-bundled to avoid a reload mid-run
        optimizeDeps: { include: ['storybook/theming'] },
        plugins: [
          storybookTest({
            configDir: path.resolve(import.meta.dirname, '.storybook'),
            storybookScript: 'storybook dev -p 6006 --no-open',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            viewport: { width: 1280, height: 800 },
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
