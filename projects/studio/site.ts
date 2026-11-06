/*
  The studio as a static site, for a host that serves files only (GitHub Pages,
  .github/workflows/deploy-site.yml): the pages of the build with the Magma they load written
  beside them, in `dist-site/`. `nx run studio:build.site`.

  The pages load Magma from three paths relative to them (vendor.ts): `node_modules/`,
  `components/` and `svg/`. The dev server and `vite preview` answer them with `fileOf` of the
  render (projects/mcp/src/render.ts); here each path a page can ask for is written as the
  file `fileOf` answers it with, so both hosts serve the same Magma:

  - `node_modules/`: the stylesheets each page imports, and what they import and load in turn
    (the fonts of @fontsource), followed from the pages of the build;
  - `components/`: the folder of the lazy loader of the installed magma (`loaderOf`), whole: the
    loader imports the chunk of a component when one first renders;
  - `svg/`: every icon slug of the installed sets (`slugFiles` of icons.ts): a page renders any.

  A path a page asks for that `fileOf` does not answer stops the site, since it would be a 404,
  and so does an icon set that is not installed. The pages say that no API stands beside them
  (API_META): the studio then does not ask `/api/config`, which a static host answers with a 404,
  and edits in memory, as without the command of the studio.
*/
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolContext } from '../mcp/src/context.ts';
import { slugFiles } from '../mcp/src/icons.ts';
import { ICON_PATH, fileOf, loaderOf } from '../mcp/src/render.ts';

/** The tag that tells the studio there is no API beside the page: `hasApi` of src/app.tsx reads it. */
const API_META = '<meta name="magma-studio-api" content="none">';

/** The sets an icon slug starts with, each of its own package (agents/assets.md, "Icons"). */
const ICON_SETS = ['mi', 'mdi', 'mgg'];

/** Any origin: the paths of a page are resolved against it as a browser does. */
const ORIGIN = 'https://studio.invalid';

/** What a stylesheet loads in turn: the `url()` of a font or an image, and an `@import`. */
const REFERENCES = /url\(\s*(['"]?)([^'")]+)\1\s*\)|@import\s+(['"])([^'"]+)\3/g;

const referencesOf = (css: string): string[] =>
  [...css.matchAll(REFERENCES)]
    .map((match) => match[2] ?? match[4]!)
    .filter((ref) => !/^(data:|[a-z]+:\/\/|#)/i.test(ref));

/** The stylesheets a page imports (vendor.ts writes them as `@import url('node_modules/...')`). */
const importsOf = (html: string): string[] =>
  [...html.matchAll(/@import url\('([^']+)'\)/g)].map((match) => match[1]!);

/** The module the page loads Magma with: `components/` and the file of the loader. */
const loaderSrcOf = (html: string): string | undefined =>
  /<script type="module" src="(components\/[^"]+)"/.exec(html)?.[1];

export interface Site {
  pages: string[];
  stylesheets: number;
  icons: number;
}

/** Writes the site of the studio at `root` (its build, `dist/`, must exist) into `out`. */
export function writeSite(root: string, out: string): Site {
  const dist = path.join(root, 'dist');
  if (!existsSync(dist))
    throw new Error(`${dist} does not exist: build the studio first (nx run studio:build)`);
  const context: ToolContext = { root, settings: {} };
  rmSync(out, { recursive: true, force: true });
  cpSync(dist, out, { recursive: true });

  const pages = readdirSync(out).filter((file) => file.endsWith('.html'));
  // the stylesheets, from the paths the pages ask for: each served file, then what it loads
  const queue: string[] = [];
  const loaders = new Set<string>();
  for (const page of pages) {
    const file = path.join(out, page);
    const html = readFileSync(file, 'utf8');
    queue.push(...importsOf(html).map((href) => new URL(href, `${ORIGIN}/${page}`).pathname));
    const loader = loaderSrcOf(html);
    if (!loader) throw new Error(`${page} loads no Magma loader: was it built with vendor.ts?`);
    loaders.add(loader);
    writeFileSync(file, html.replace('</head>', `  ${API_META}\n  </head>`));
  }
  const written = new Set<string>();
  while (queue.length) {
    const pathname = decodeURIComponent(queue.shift()!);
    if (written.has(pathname)) continue;
    const file = fileOf(context, pathname);
    if (!file) throw new Error(`${pathname} is asked for by the studio and is not installed`);
    const target = path.join(out, pathname);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(file, target);
    written.add(pathname);
    if (file.endsWith('.css'))
      for (const ref of referencesOf(readFileSync(file, 'utf8')))
        queue.push(new URL(ref, `${ORIGIN}${pathname}`).pathname);
  }

  // the loader and its chunks, as `fileOf` serves `components/`
  cpSync(path.dirname(loaderOf(context)), path.join(out, 'components'), {
    recursive: true,
    dereference: true,
  });
  for (const loader of loaders)
    if (!existsSync(path.join(out, loader)))
      throw new Error(`${loader} is not in the installed magma`);

  // the icons, one file per slug, as `fileOf` serves `svg/`
  const icons = slugFiles(context);
  const missing = ICON_SETS.filter((set) => !icons.some(([slug]) => slug.startsWith(`${set}/`)));
  if (missing.length) throw new Error(`the icon sets ${missing.join(', ')} are not installed`);
  const folders = new Set<string>();
  for (const [slug, file] of icons) {
    const target = path.join(out, ICON_PATH, `${slug}.svg`);
    const folder = path.dirname(target);
    if (!folders.has(folder)) mkdirSync(folder, { recursive: true });
    folders.add(folder);
    copyFileSync(file, target);
  }
  return { pages, stylesheets: written.size, icons: icons.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const out = path.join(root, 'dist-site');
  const site = writeSite(root, out);
  console.log(
    `${path.relative(process.cwd(), out)}: ${site.pages.join(', ')}, ${site.stylesheets} files of the stylesheets, ${site.icons} icons`,
  );
}
