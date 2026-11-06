import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { magmaVendor } from './vendor.ts';

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

export default defineConfig({
  root,
  plugins: [resolveMts(), magmaVendor(root)],
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
    // the studio, and the page of a scene the Theme section shows in its iframe
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        scene: fileURLToPath(new URL('./scene.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5177,
    // pin the port: if 5177 is busy it is this same studio, so fail fast
    // instead of silently moving to 5178 (which spawns confusing extra instances)
    strictPort: true,
  },
  test: {
    include: ['test/**/*.test.mts'],
  },
});
