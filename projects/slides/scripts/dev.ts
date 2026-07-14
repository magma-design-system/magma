/**
 * Live dev server: render an example deck in the browser and reload on every
 * change to Markdown, render logic, or theme CSS - no manual rebuild.
 *
 * Run via Nx:
 *   nx run slides:dev
 *   nx run slides:dev -- --port 4000
 * then open the printed URL. Pick a deck with `?deck=<path-relative-to-examples>`
 * (e.g. http://localhost:5178/?deck=magma/deck.md); defaults to the first deck.
 *
 * How it stays live:
 *   - render logic + parser are loaded through Vite `ssrLoadModule`, so editing
 *     any src/*.ts re-renders on the next request (fresh module graph);
 *   - the static theme CSS (tokens/deck-view/theme-*) is read from src/theme by
 *     collectCss, so those edits are live too;
 *   - slides.css is a build artifact absent from source, so slides.src.css is
 *     compiled here in-memory (same Tailwind pass as the build, so `@source`
 *     re-scans the template markup - footer utilities included);
 *   - any watched change invalidates the CSS cache and triggers a full reload.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { createServer, type Plugin } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const examplesDir = path.join(root, 'examples');
const slidesSrc = path.join(root, 'src/theme/slides.src.css');

const portArg = process.argv.indexOf('--port');
const port = portArg > -1 ? Number(process.argv[portArg + 1]) : 5178;

/** Map relative `.js` specifiers to their sibling `.ts` so the NodeNext-style
 *  source (import '../x.js') loads under Vite SSR without a prior tsc build. */
function resolveJsToTs(): Plugin {
  return {
    name: 'resolve-js-to-ts',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.js')) return null;
      const candidate = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'));
      return existsSync(candidate) ? candidate : null;
    },
  };
}

const listDecks = (): string[] =>
  (readdirSync(examplesDir, { recursive: true }) as string[])
    .filter((f) => f.endsWith('.md'))
    .sort();

// Compiled slides.css cache; invalidated whenever a source/theme file changes.
let cssCache: string | null = null;
async function structuralCss(): Promise<string> {
  if (cssCache != null) return cssCache;
  const result = await postcss([tailwind()]).process(readFileSync(slidesSrc, 'utf8'), {
    from: slidesSrc,
  });
  cssCache = result.css;
  return cssCache;
}

const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  server: { port },
  plugins: [resolveJsToTs()],
});

server.watcher.add([examplesDir, path.join(root, 'src')]);
server.watcher.on('change', (file) => {
  if (file.endsWith('.css') || file.endsWith('.ts')) cssCache = null;
  server.ws.send({ type: 'full-reload' });
});

server.middlewares.use(async (req, res, next) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname !== '/') return next();

    const decks = listDecks();
    const rel = url.searchParams.get('deck') || decks[0];
    if (!rel) {
      res.statusCode = 404;
      res.end('No .md decks found under examples/');
      return;
    }
    const file = path.join(examplesDir, rel);
    const baseDir = path.dirname(file);

    const { parseDeck } = await server.ssrLoadModule('/src/parser/parse.ts');
    const { exportHtml } = await server.ssrLoadModule('/src/export/html.ts');
    const { applyUtilities } = await server.ssrLoadModule('/src/export/tailwind.ts');

    const deck = parseDeck(readFileSync(file, 'utf8'));
    let html = exportHtml(deck, { baseDir });
    // slides.css is absent from source: inject the compiled structural CSS.
    html = html.replace('</head>', `<style>${await structuralCss()}</style>\n</head>`);
    // author utilities (same pass as build-examples), then the HMR client.
    html = await applyUtilities(html);
    html = html.replace('<head>', '<head>\n<script type="module" src="/@vite/client"></script>');

    res.setHeader('content-type', 'text/html');
    res.end(html);
  } catch (error) {
    next(error);
  }
});

await server.listen();
console.log(`\n  slides dev server -> http://localhost:${port}/`);
console.log('  switch deck with ?deck=<relative-md-path>, e.g. ?deck=magma/deck.md');
console.log('  available decks:');
for (const deck of listDecks()) console.log(`    - ${deck}`);
console.log('');
