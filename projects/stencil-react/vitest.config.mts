import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// The tests import the built package (`@maggioli-design-system/magma-react`, the workspace link to
// ./dist) and the custom elements of `@maggioli-design-system/magma`: `nx run stencil-react:test`
// builds both first.
export default defineConfig({
  // the tests are not covered by tsconfig.json (`jsx: react`, sources only)
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    projects: [
      {
        extends: true,
        // the client wrappers: React props and events against the real, hydrated custom elements
        optimizeDeps: {
          // dependencies of the built package, pre-bundled to avoid a reload mid-run
          include: [
            '@stencil/react-output-target/runtime',
            '@stencil/react-output-target/ssr',
            '@testing-library/react',
            'react',
            'react-dom',
            'react/jsx-dev-runtime',
          ],
        },
        test: {
          name: 'browser',
          include: ['test/**/*.e2e.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        // the `<tag>.server.js` wrappers take their renderToString path only without `window`
        test: {
          name: 'node',
          include: ['test/**/*.spec.{ts,tsx}'],
          environment: 'node',
          server: {
            deps: {
              // the builds of magma and magma-react are workspace links, which Vite would transform
              // like sources: Node loads them as a consumer does. Through Vite the bare builtin
              // import of the hydrate module (`from 'stream'`) does not resolve
              external: [/\/projects\/stencil(-react)?\/dist\//],
            },
          },
        },
      },
    ],
  },
});
