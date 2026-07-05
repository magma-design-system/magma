import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';

// the generator sources are .mts files imported with .mjs specifiers
// (node/tsc convention); vite needs help mapping the extension
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

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [resolveMts()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  resolve: {
    alias: {
      chalk: chalkStub,
    },
  },
  server: {
    port: 5177,
  },
});
