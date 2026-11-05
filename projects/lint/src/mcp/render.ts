/*
  render_preview: Magma markup rendered as an image on the magma the project installed, so the
  agent shows a person what it is talking about instead of describing it (#1180). The page is
  served from the installed packages on an origin that exists nowhere, offline: what it asks
  for anywhere else is refused and reported. Before the capture it waits for the components,
  the fonts and the animations (./render-page.ts); after it, the tool checks its own image,
  element by element, and marks an image with a problem as not representative.

  The decisions of #1180: the driver is playwright-core from the project (an optional peer of
  magma, as ESLint and Stylelint are), driving a browser of the machine; the image goes back
  as MCP image content and as a file in node_modules/.cache, which the agent attaches where its
  client does not show the image to the person. Instead of markup it renders the preview of a
  case of a pattern (agents/patterns/previews/<pattern>/<case>.html, #1186), of a situation of a
  building block (previews/<block>/<situation>.html, asked as its case), or of a rule of a
  domain, and another example of any (<id>.<n>.html, #1221), with the height of its page and
  the language of its words, so the check of the image runs on every preview.

  The same render makes the images magma ships of its previews (#1243, renderPreviewImages):
  the build of magma renders every preview in the frame of PREVIEW_IMAGE of the core, light and
  dark, and fails on an image with a problem, so no image ships that the check did not pass.
*/
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { magmaRoot } from '../core/data.js';
import {
  BLOCK,
  examplesOf,
  indexPatterns,
  ownRules,
  PREVIEW_IMAGE,
  PREVIEW_IMAGE_MODES,
  previewOf,
  readPatternDir,
  readPreviews,
  situationIds,
  type Preview,
  type PreviewImageMode,
} from '../core/patterns.js';
import { packageDir, readJsonFile, resolvePackage, type ToolContext } from './context.js';
import { folderOf, slugFile } from './icons.js';
import { ToolError, withImages, type Tool } from './protocol.js';
import { inPage, PREVIEW_ID, type Inspection, type PageProblem, type Step } from './render-page.js';

/** The origin the page is served from: `.invalid` never resolves (RFC 2606), https makes it a secure context. */
const ORIGIN = 'https://preview.magma.invalid';

/**
 * The stylesheets of a consumer page, in the order and the layers of agents/assets.md, "Import
 * order (mandatory)": a render looks like the product only with the same cascade. A test holds
 * the list to the guide. A package the project did not install is left out, and the inspection
 * reports what it would have given (a font not loaded).
 */
export const STYLESHEETS: Array<{ module: string; layer: string }> = [
  { module: 'normalize.css', layer: 'reset' },
  { module: '@fontsource/karla/400.css', layer: 'vendor' },
  { module: '@fontsource/karla/700.css', layer: 'vendor' },
  { module: '@fontsource/merriweather/300.css', layer: 'vendor' },
  { module: '@fontsource/merriweather/400.css', layer: 'vendor' },
  { module: '@fontsource/merriweather/700.css', layer: 'vendor' },
  { module: '@fontsource/roboto/500.css', layer: 'vendor' },
  { module: '@fontsource/roboto/700.css', layer: 'vendor' },
  { module: '@fontsource/roboto/900.css', layer: 'vendor' },
  { module: '@fontsource/roboto-mono/400.css', layer: 'vendor' },
  { module: '@maggioli-design-system/styles/dist/css/colors-rgb.css', layer: 'theme' },
  { module: '@maggioli-design-system/styles/dist/css/typography.css', layer: 'theme' },
  { module: '@maggioli-design-system/styles/dist/css/reset.css', layer: 'reset' },
  { module: '@maggioli-design-system/styles/dist/css/hydrated.css', layer: 'base' },
  { module: '@maggioli-design-system/styles/dist/css/transitions.css', layer: 'base' },
  { module: '@maggioli-design-system/styles/dist/css/animations.css', layer: 'base' },
  { module: '@maggioli-design-system/styles/dist/css/globals.css', layer: 'theme' },
  { module: '@maggioli-design-system/styles/dist/css/semantic.css', layer: 'theme' },
  { module: '@maggioli-design-system/styles/dist/css/themes.css', layer: 'theme' },
  { module: '@maggioli-design-system/styles/dist/css/base.css', layer: 'base' },
];

/** The layer order those imports rely on, the first line of the same block. */
export const LAYERS = '@layer reset, vendor, theme, base, components, utilities, overrides;';

/**
 * The Tailwind entry point of a consumer, agents/assets.md, "Tailwind (optional)": the page
 * compiles it with the project's Tailwind 4 on the classes of the markup, so the markup may
 * write the Magma utilities (`max-w-form`, `p-0`, `dark:`) as a product with Tailwind writes
 * them (#1220). A test holds it to the block of the guide.
 */
export const TAILWIND = `@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '@maggioli-design-system/styles/dist/tailwind/theme.css';
@import '@maggioli-design-system/styles/dist/tailwind/typography.css';
@import '@maggioli-design-system/styles/dist/tailwind/utilities.css';`;

type Compile = (
  css: string,
  options: {
    base: string;
    loadStylesheet: (
      id: string,
      base: string,
    ) => Promise<{ path: string; base: string; content: string }>;
  },
) => Promise<{ build: (candidates: string[]) => string }>;

/** A module resolved from a folder, as an @import of a stylesheet there resolves it. */
const resolveIn = (base: string, id: string): string | undefined => {
  if (id.startsWith('.') || path.isAbsolute(id)) return path.resolve(base, id);
  try {
    return createRequire(path.join(base, 'package.json')).resolve(id);
  } catch {
    return undefined;
  }
};

/**
 * The CSS of the Tailwind classes of the markup, or undefined when the project has no
 * Tailwind 4 (`compile` of tailwindcss, the API its PostCSS and Vite plugins call). The
 * candidates are the tokens of the markup between spaces, quotes, angle brackets and `=`:
 * Tailwind keeps the ones that name a utility and drops the others, as when it scans a
 * source, so a word of the text that names one (`flex`) gives its rule, as in a build.
 */
export const tailwindOf = async (
  context: ToolContext,
  markup: string,
): Promise<string | undefined> => {
  const file = context.tailwind === false ? undefined : resolvePackage(context, 'tailwindcss');
  if (!file) return undefined;
  const module = (await import(pathToFileURL(file).href)) as {
    compile?: Compile;
    default?: { compile?: Compile };
  };
  const compile = module.compile ?? module.default?.compile;
  // Tailwind 3 has no compile: its classes come from its own build
  if (!compile) return undefined;
  const compiler = await compile(TAILWIND, {
    base: context.root,
    loadStylesheet: async (id, base) => {
      const found = resolveIn(base, id) ?? resolvePackage(context, id);
      if (!found || !existsSync(found))
        throw new ToolError(
          `The Tailwind entry of agents/assets.md imports ${id}, which the project does not have.`,
        );
      return { path: found, base: path.dirname(found), content: readFileSync(found, 'utf8') };
    },
  });
  const candidates = [...new Set(markup.split(/[\s"'`<>=]+/).filter(Boolean))];
  return compiler.build(candidates);
};

/** `@fontsource/karla/400.css` -> `@fontsource/karla`. */
const packageOf = (module: string): string => {
  const [first, second] = module.split('/');
  return first!.startsWith('@') ? `${first}/${second}` : first!;
};

/** The lazy loader of the components, in the magma package: what a <script type="module"> loads. */
const LOADER = 'dist/magma-components/magma-components.esm.js';

/**
 * The loader of the context (the tests), else the one of the installed magma; its chunks sit
 * beside it. Exported for the page of the studio (projects/studio), which loads Magma as a
 * render does.
 */
export const loaderOf = (context: ToolContext): string =>
  context.loader ?? path.join(magmaRoot(context.settings), LOADER);

/** The path mds-icon fetches the icons from, set the way agents/assets.md gives (the sessionStorage key). */
export const ICON_PATH = '/svg/';

/**
 * The first script of the page, before the loader: mds-icon reads its path before the first
 * icon renders; Stencil emits appload once the components of the first load are ready
 * (./render-page.ts); `__name` is the helper a TypeScript runner that keeps function names
 * (tsx) puts in the source sent to the page. In the page, not in an init script of the
 * driver, so that the page serve.previews shows (scripts/serve-previews.ts) is this one.
 */
export const INIT_SCRIPT = `sessionStorage.setItem('mdsIconSvgPath', '${ICON_PATH}');
addEventListener('appload', () => { window.magmaAppLoaded = true; });
globalThis.__name = (fn) => fn;`;

export const MODES = ['light', 'dark'] as const;

/**
 * The longest side of an image: Claude Code caps an image of a tool result at 2000 px a side
 * (CHANGELOG 2.1.122), as the Anthropic API does for a request with many images (vision docs).
 * Four images of that size stay under the 25,000 tokens Claude Code allows a tool result.
 */
export const MAX_SIDE = 2000;
export const MAX_IMAGES = 4;
export const MIN_WIDTH = 320;

/** A stylesheet of the installed styles, or undefined. */
const stylesOf = (context: ToolContext, name: string): string | undefined => {
  const dir = packageDir(context, '@maggioli-design-system/styles');
  const file = dir && path.join(dir, 'dist/css', name);
  return file && existsSync(file) ? readFileSync(file, 'utf8') : undefined;
};

/**
 * The named themes of the installed styles, as themes.css names them: first every theme it
 * publishes a preview of (`--magma-preview-<name>-wash`, since #692), in the order of the config,
 * which includes the base theme (business emits no rule of its own); then the values of
 * `data-theme-name` it styles, the only names an older themes.css has.
 */
export const themesOf = (context: ToolContext): string[] => {
  const css = stylesOf(context, 'themes.css') ?? '';
  return [
    ...new Set([
      ...[...css.matchAll(/--magma-preview-([a-z]+(?:-[a-z]+)*)-wash\s*:/g)].map((one) => one[1]!),
      ...[...css.matchAll(/\[data-theme-name=['"]?([\w-]+)/g)].map((one) => one[1]!),
    ]),
  ];
};

/** The Magma breakpoints, by name: the `--breakpoint-*` of the installed typography.css. */
export const breakpointsOf = (context: ToolContext): Record<string, number> =>
  Object.fromEntries(
    [
      ...(stylesOf(context, 'typography.css') ?? '').matchAll(/--breakpoint-([\w-]+):\s*(\d+)px/g),
    ].map((one) => [one[1]!, Number(one[2])]),
  );

/** The width an image has when none is asked: the Magma breakpoint where the desktop layout starts. */
export const DEFAULT_WIDTH = 'desktop';

// The part of Playwright the tool calls, all of it in Playwright 1.9 (playwright.dev/docs/api,
// "Added before v1.9" or "Added in: v1.9" for page.on('pageerror')): the floor of the peer range.
interface Chromium {
  launch: (options?: Record<string, unknown>) => Promise<Browser>;
}
interface Browser {
  newContext: (options: Record<string, unknown>) => Promise<BrowserContext>;
  close: () => Promise<void>;
}
interface BrowserContext {
  newPage: () => Promise<Page>;
  route: (url: string, handler: (route: Route) => Promise<void>) => Promise<void>;
  addInitScript: (script: string) => Promise<void>;
  close: () => Promise<void>;
}
interface Route {
  request: () => { url: () => string };
  fulfill: (response: {
    status?: number;
    body?: Buffer | string;
    contentType?: string;
  }) => Promise<void>;
  abort: (code?: string) => Promise<void>;
}
interface Page {
  on: (event: string, listener: (value: never) => void) => void;
  goto: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  evaluate: <T>(fn: (args: Step) => Promise<T>, args: Step) => Promise<T>;
  setViewportSize: (size: { width: number; height: number }) => Promise<void>;
  screenshot: (options?: Record<string, unknown>) => Promise<Buffer>;
}

/**
 * The browser driver: playwright-core from the project, else playwright, which depends on it.
 * Magma ships no browser and installs no driver: a project that renders adds playwright-core.
 */
const chromiumOf = async (context: ToolContext): Promise<Chromium | undefined> => {
  for (const id of ['playwright-core', 'playwright'])
    try {
      const file = resolvePackage(context, id);
      if (!file) continue;
      const module = (await import(pathToFileURL(file).href)) as {
        chromium?: Chromium;
        default?: { chromium?: Chromium };
      };
      const chromium = module.chromium ?? module.default?.chromium;
      if (chromium) return chromium;
    } catch {
      // try the next one
    }
  return undefined;
};

/**
 * A browser of the machine: Google Chrome, then Microsoft Edge, which Playwright finds where
 * their installers put them (the `channel` of a branded browser, playwright.dev/docs/browsers),
 * then the Chromium `npx playwright install chromium` downloads for the installed version.
 */
const launch = async (chromium: Chromium): Promise<Browser> => {
  const failures: string[] = [];
  for (const channel of ['chrome', 'msedge', undefined])
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch (failure) {
      failures.push(
        `${channel ?? 'chromium'}: ${String((failure as Error).message).split('\n')[0]}`,
      );
    }
  throw new ToolError(
    `render_preview found no browser: install Google Chrome or Microsoft Edge, or run npx playwright install chromium. ${failures.join('; ')}`,
  );
};

/** The file a path of the page is served from, or undefined when the page may not read it. */
export const fileOf = (context: ToolContext, pathname: string): string | undefined => {
  const inside = (dir: string | undefined, rest: string) => {
    if (!dir) return undefined;
    const file = path.resolve(dir, rest);
    return file.startsWith(dir + path.sep) && existsSync(file) ? file : undefined;
  };
  if (pathname.startsWith('/components/'))
    return inside(path.dirname(loaderOf(context)), pathname.slice('/components/'.length));
  if (pathname.startsWith(ICON_PATH)) {
    const slug = pathname.slice(ICON_PATH.length).replace(/\.svg$/, '');
    const set = slug.split('/')[0];
    const folder =
      set === 'mi' || set === 'mdi' || set === 'mgg' ? folderOf(context, set) : undefined;
    const file = folder && slugFile(folder, slug);
    return file && existsSync(file) ? file : undefined;
  }
  // the packages of the stylesheets, and nothing else of node_modules
  if (pathname.startsWith('/node_modules/')) {
    const rest = pathname.slice('/node_modules/'.length);
    const name = STYLESHEETS.map(({ module }) => packageOf(module)).find((one) =>
      rest.startsWith(`${one}/`),
    );
    return name ? inside(packageDir(context, name), rest.slice(name.length + 1)) : undefined;
  }
  return undefined;
};

/** The content types of the files the page loads, by extension. */
export const TYPES: Record<string, string> = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/** What makes the page; the other options are how it is captured. */
export type PageOptions = Pick<Options, 'markup' | 'wholePage' | 'prefMode' | 'theme' | 'lang'> & {
  /** The CSS of the Tailwind classes of the markup (`tailwindOf`). */
  utilities?: string;
};

/**
 * The `@import` of each stylesheet of a consumer page, in its layer, at `base` followed by the
 * package and the file (`fileOf` serves `/node_modules/`). Each module as Node resolves it from
 * the project: a bare `normalize.css` is its main file. The studio (projects/studio) imports the
 * same list under a path relative to its page.
 */
export const stylesheetImports = (context: ToolContext, base = '/node_modules/'): string[] =>
  STYLESHEETS.flatMap(({ module, layer }) => {
    const file = resolvePackage(context, module);
    const dir = packageDir(context, packageOf(module));
    if (!file || !dir) return [];
    const url = `${base}${packageOf(module)}/${path.relative(dir, file).split(path.sep).join('/')}`;
    return [`@import url('${url}') layer(${layer});`];
  });

/** The page: the stylesheets of a consumer, the loader of the components, the markup. */
export const pageOf = (context: ToolContext, options: PageOptions): string => {
  const imports = stylesheetImports(context);
  const lang = options.lang ? ` lang="${options.lang}"` : '';
  const theme = options.theme ? ` data-theme-name="${options.theme}"` : '';
  const pref = options.prefMode ? ` data-magma-pref class="pref-mode-${options.prefMode}"` : '';
  return `<!doctype html>
<html${lang}${theme}${pref}>
<head>
<meta charset="utf-8">
<style>
${LAYERS}
${imports.join('\n')}
${(options.utilities ?? '').replace(/<\/style/gi, '<\\/style')}
#${PREVIEW_ID} { display: flow-root; padding: ${options.wholePage ? 0 : 24}px; }
</style>
<script>
${INIT_SCRIPT}
</script>
<script type="module" src="/components/${path.basename(loaderOf(context))}"></script>
</head>
<body>
<div id="${PREVIEW_ID}">
${options.markup}
</div>
</body>
</html>`;
};

/** Where the images are written: the cache folder of the project's node_modules, never committed (#1180). */
export const PREVIEW_DIR = 'node_modules/.cache/magma/previews';

interface Options {
  markup: string;
  widths: number[];
  height?: number;
  /** The markup is a whole page, with a frame of its own: no inset around it. */
  wholePage?: boolean;
  mode: (typeof MODES)[number];
  /**
   * The mode set in the page, as a controller sets it (`data-magma-pref` and
   * `pref-mode-<mode>` on <html>, styles/SPEC.md), instead of the mode of the system the
   * driver emulates: a browser gives a frame the prefers-color-scheme of the system,
   * whatever the color-scheme of the frame (Chrome 154), so serve.previews sets it this
   * way; the tests prove the image is the one of the emulated mode.
   */
  prefMode?: (typeof MODES)[number];
  theme?: string;
  lang?: string;
  /** How long a page may take to load and settle: the tests shorten it. */
  timeout?: number;
}

export interface Image {
  width: number;
  height: number;
  file: string;
  representative: boolean;
  problems: PageProblem[];
}

/** How long a page may take to load and settle. */
const TIMEOUT = 15_000;

/**
 * A frame of a fixed size, the one of the images Magma ships of its previews (#1243): the
 * viewport keeps its height whatever the content, the image has scale device pixels per CSS
 * pixel and is encoded as WebP at that quality too.
 */
interface Frame {
  height: number;
  scale: number;
  quality: number;
}

/** One page at one width: the image and what is wrong in it. */
const capture = async (
  context: ToolContext,
  browser: Browser,
  html: string,
  width: number,
  options: Options,
  frame?: Frame,
): Promise<{ png: Buffer; webp?: Buffer; height: number; problems: PageProblem[] }> => {
  const session = await browser.newContext({
    viewport: { width, height: frame?.height ?? options.height ?? 600 },
    deviceScaleFactor: frame?.scale ?? 1,
    colorScheme: options.mode,
  });
  try {
    const problems: PageProblem[] = [];
    await session.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== ORIGIN) {
        problems.push({
          kind: 'asset',
          detail: `${url.href} was not loaded: the render is offline and serves only the packages installed in the project.`,
        });
        return route.abort('blockedbyclient');
      }
      if (url.pathname === '/') return route.fulfill({ body: html, contentType: 'text/html' });
      const file = fileOf(context, decodeURIComponent(url.pathname));
      if (!file) {
        problems.push({
          kind: 'asset',
          detail: url.pathname.startsWith(ICON_PATH)
            ? `The icon ${url.pathname.slice(ICON_PATH.length, -'.svg'.length)} is not in the icon sets the project installed: check it with find_icon.`
            : `The page asked for ${url.pathname}, which the render cannot serve: it serves the installed packages only. Give an image as a data: URL.`,
        });
        return route.fulfill({ status: 404, body: '' });
      }
      return route.fulfill({
        body: readFileSync(file),
        contentType: TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
    });
    const page = await session.newPage();
    page.on('console', (message: { type: () => string; text: () => string }) => {
      // the browser's own line for a failed request: the asset problem names it better
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource'))
        problems.push({ kind: 'console-error', detail: message.text() });
    });
    page.on('pageerror', (error: Error) =>
      problems.push({ kind: 'console-error', detail: error.message }),
    );

    const timeout = options.timeout ?? TIMEOUT;
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle', timeout });
    await page.evaluate(inPage, { step: 'settle', timeout: timeout / 2 });
    let inspection = (await page.evaluate(inPage, { step: 'inspect' })) as Inspection;
    const height = frame?.height ?? options.height ?? Math.min(inspection.height, MAX_SIDE);
    // a frame shows what fits in it, by its choice: the rest of the content is no cut
    const sized = frame !== undefined || options.height !== undefined;
    if (!sized) {
      // the viewport as tall as the content: a layout that depends on the height settles again
      await page.setViewportSize({ width, height });
      await page.evaluate(inPage, { step: 'settle', timeout: Math.min(2000, timeout / 2) });
      inspection = (await page.evaluate(inPage, { step: 'inspect' })) as Inspection;
    }
    if (!sized && inspection.height > MAX_SIDE)
      problems.push({
        kind: 'cut',
        detail: `The content is ${inspection.height} px tall and the image shows its first ${MAX_SIDE}: render a part of it, or each part on its own.`,
      });
    const png = await page.screenshot({ type: 'png' });
    // in a frame, a component its edge cuts shows a part of itself, which may be all one colour
    // (the top of a card): the frame judges the components it shows whole
    const regions = frame
      ? inspection.regions.filter(
          (one) => one.x + one.width <= width && one.y + one.height <= frame.height,
        )
      : inspection.regions;
    const flat = (await page.evaluate(inPage, {
      step: 'pixels',
      png: png.toString('base64'),
      scale: frame?.scale ?? 1,
      regions,
    })) as PageProblem[];
    const webp = frame
      ? Buffer.from(
          (await page.evaluate(inPage, {
            step: 'encode',
            png: png.toString('base64'),
            quality: frame.quality,
          })) as string,
          'base64',
        )
      : undefined;
    const all = [...problems, ...inspection.problems, ...flat];
    // one problem once: a component asks for a missing icon on each render
    const seen = new Set<string>();
    const unique = all.filter((one) => {
      const key = JSON.stringify(one);
      return !seen.has(key) && seen.add(key);
    });
    return { png, ...(webp ? { webp } : {}), height, problems: unique };
  } finally {
    await session.close();
  }
};

/** The browser the images are made in, once the project has a driver and its magma can load its components. */
const browserFor = async (context: ToolContext): Promise<Browser> => {
  const chromium = await chromiumOf(context);
  if (!chromium)
    throw new ToolError(
      'render_preview needs playwright-core in the project: npm i -D playwright-core. It drives the Google Chrome or Microsoft Edge of the machine and downloads no browser (agents/mcp.md, "Show the person what you mean").',
    );
  if (!existsSync(loaderOf(context)))
    throw new ToolError(`The installed magma has no ${LOADER}: the components cannot load.`);
  return launch(chromium);
};

/** The page of the markup, and the problem every image of it has when its Tailwind classes cannot compile. */
const pageFor = async (
  context: ToolContext,
  options: PageOptions,
): Promise<{ html: string; untailwinded: PageProblem[] }> => {
  const utilities = await tailwindOf(context, options.markup);
  const html = pageOf(context, { ...options, ...(utilities ? { utilities } : {}) });
  // classes with no style element of the markup to give them rules are Tailwind classes, which
  // a project without Tailwind 4 cannot compile: the image shows them without their rules
  const untailwinded: PageProblem[] =
    utilities === undefined &&
    /\bclass\s*=/i.test(options.markup) &&
    !/<style\b/i.test(options.markup)
      ? [
          {
            kind: 'asset',
            detail:
              'The markup has classes and the project has no Tailwind 4 (tailwindcss): its Tailwind classes give nothing in the image. Install it (agents/assets.md, "Tailwind (optional)"), or write the custom property a class carries in a style attribute.',
          },
        ]
      : [];
  return { html, untailwinded };
};

/** Render the markup at each width: the image, the file it is written to and what is wrong in it. */
export const render = async (
  context: ToolContext,
  options: Options,
): Promise<Array<Image & { png: Buffer }>> => {
  const version =
    readJsonFile<{ version: string }>(path.join(magmaRoot(context.settings), 'package.json'))
      ?.version ?? '';
  const { html, untailwinded } = await pageFor(context, options);
  const out = path.join(context.root, PREVIEW_DIR);
  mkdirSync(out, { recursive: true });
  // the same markup, options and magma give the same file, written again: the time a page
  // may take is no part of what it shows
  const id = createHash('sha256')
    .update(JSON.stringify({ ...options, timeout: undefined, version }))
    .digest('hex')
    .slice(0, 12);

  const browser = await browserFor(context);
  try {
    const images: Array<Image & { png: Buffer }> = [];
    for (const width of options.widths) {
      const captured = await capture(context, browser, html, width, options);
      const { png, height } = captured;
      const problems = [...untailwinded, ...captured.problems];
      const file = path.join(out, `${id}-${width}-${options.mode}.png`);
      writeFileSync(file, png);
      images.push({ width, height, file, png, representative: !problems.length, problems });
    }
    return images;
  } finally {
    await browser.close();
  }
};

/** The image of a preview Magma ships in one mode, as WebP, and what is wrong in it. */
export interface PreviewImage {
  preview: Preview;
  mode: PreviewImageMode;
  webp: Buffer;
  problems: PageProblem[];
}

/**
 * The images of the previews Magma ships (#1243): each preview in each mode, in the frame of
 * PREVIEW_IMAGE of the core, checked as render_preview checks an image and encoded as WebP from
 * the capture it checked; its words in the language of the previews and a whole page without
 * the inset, as render_preview renders a preview. One browser, a few previews at a time (a page
 * waits mostly for its components and its fonts); the images in the order of the previews.
 */
export const renderPreviewImages = async (
  context: ToolContext,
  previews: Preview[],
  concurrency = 2,
): Promise<PreviewImage[]> => {
  const browser = await browserFor(context);
  const images: PreviewImage[][] = [];
  let next = 0;
  const work = async () => {
    while (next < previews.length) {
      const at = next++;
      const preview = previews[at]!;
      const options = {
        markup: preview.markup,
        lang: PREVIEW_LANG,
        ...(preview.wholePage ? { wholePage: true } : {}),
      };
      const made: PreviewImage[] = [];
      try {
        const { html, untailwinded } = await pageFor(context, options);
        for (const mode of PREVIEW_IMAGE_MODES) {
          const { webp, problems } = await capture(
            context,
            browser,
            html,
            PREVIEW_IMAGE.width,
            { ...options, widths: [PREVIEW_IMAGE.width], mode },
            PREVIEW_IMAGE,
          );
          made.push({ preview, mode, webp: webp!, problems: [...untailwinded, ...problems] });
        }
      } catch (error) {
        // a page that does not load (a timeout): the preview it is, not only the driver's words
        throw new Error(
          `${path.relative(context.root, preview.file)}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      images[at] = made;
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, work));
    return images.flat();
  } finally {
    await browser.close();
  }
};

const string = { type: 'string' };

/**
 * The preview Magma ships of a case of a pattern, of a situation of a building block (asked as
 * its case: a block has no cases), or of a rule of a domain (#1221), by the id of its pattern (an
 * old one too) and of the case, the situation or the rule, its first example unless another is
 * asked; the words of the previews are Italian, as the examples of the components
 * (docs/PATTERNS.md).
 */
export const PREVIEW_LANG = 'it';
const shippedPreview = (
  context: ToolContext,
  pattern: string,
  wanted: { kind: 'case' | 'rule'; id: string },
  example: number,
) => {
  const dir = path.join(magmaRoot(context.settings), 'agents', 'patterns');
  const { byId, aliases } = indexPatterns(readPatternDir(dir).map((one) => one.data));
  const realId = byId.has(pattern) ? pattern : aliases.get(pattern);
  const data = realId ? byId.get(realId) : undefined;
  if (!realId || !data)
    throw new ToolError(
      `No pattern ${pattern} in this magma: the patterns are ${[...byId.keys()].join(', ')}.`,
    );
  const { kind, id } = wanted;
  // the situations of a block stand where the cases of a pattern do: each has its preview
  const isBlock = data.kind === BLOCK;
  const cases = isBlock ? situationIds(data) : (data.cases ?? []).map((one) => one.id);
  const noun = isBlock && kind === 'case' ? 'situation' : kind;
  const rules = ownRules(data);
  // a case asked as a rule, or a rule as a case: say which it is
  if (kind === 'case' && !cases.includes(id) && rules.includes(id))
    throw new ToolError(`${id} is a rule of ${realId}, not a case: give rule.`);
  if (kind === 'rule' && !rules.includes(id))
    throw new ToolError(
      cases.includes(id)
        ? `${id} is a case of ${realId}, not a rule: give case.`
        : `${realId} has no rule ${id} of its own${rules.length ? `: its rules are ${rules.join(', ')}` : ''}.`,
    );
  const previews = readPreviews(dir).filter((one) => one.pattern === realId);
  const ofKind = previews.filter((one) => (kind === 'rule') === rules.includes(one.id));
  const found = previewOf(previews, realId, id, example);
  if (!found) {
    const examples = examplesOf(previews, realId, id);
    throw new ToolError(
      examples.length
        ? `The ${noun} ${id} of ${realId} has ${examples.length} example${examples.length > 1 ? 's' : ''}: example is 1 to ${examples.length}.`
        : ofKind.length
          ? `No preview of the ${noun} ${id} of ${realId}: the ${noun}s with one are ${[...new Set(ofKind.map((one) => one.id))].join(', ')}.`
          : `${realId} has no preview of its ${noun}s in this magma yet.`,
    );
  }
  return found;
};

export const renderPreview = (context: ToolContext): Tool => ({
  name: 'render_preview',
  title: 'Render Magma markup as an image',
  description:
    'Render HTML with Magma components on the magma installed in the project, offline, and get the image (to look at, and to show the person) with its file, and a report of what in it is not representative: a component unknown or not hydrated, an element with no size, a component that shows one flat colour, a console error, an icon, a font or an image that did not load, a word broken across lines, content cut. Instead of markup, pattern and case render the preview Magma ships for that case of a pattern (for a building block, case is the id of one of its situations), pattern and rule the preview of a rule of a domain of Foundation, and example another example of either. Render each option before asking a person to decide on an interface. Needs playwright-core in the project and Chrome or Edge on the machine; writes the image into node_modules/.cache/magma/previews.',
  inputSchema: {
    type: 'object',
    properties: {
      markup: {
        type: 'string',
        description:
          'The HTML to render, the body of a page: mds-* components, plain elements, a <style> for the layout; a <script> runs, offline. Images as data: URLs.',
      },
      pattern: {
        type: 'string',
        description:
          'Instead of markup, with case: a pattern of get_pattern, such as "message-placement".',
      },
      case: {
        type: 'string',
        description:
          'With pattern: one of its cases, such as "action-failed-in-place", or for a building block the id of one of its situations, such as "requests-of-an-office" of "page-header"; its preview is rendered with the height and the language it declares.',
      },
      rule: {
        type: 'string',
        description:
          'With pattern, instead of case: a rule of a domain of Foundation with a preview, such as "stacked" of "actions" (get_guide lists them).',
      },
      example: {
        type: 'integer',
        minimum: 1,
        description:
          'With case or rule: which example of it, 1 (default) for the first, 2 on for the others get_pattern lists in examples.',
      },
      widths: {
        type: 'array',
        items: { type: ['string', 'integer'] },
        maxItems: MAX_IMAGES,
        description: `The viewport widths, one image each: a Magma breakpoint (mobile, tablet, desktop, wide, ...) or pixels from ${MIN_WIDTH} to ${MAX_SIDE}. Default ["${DEFAULT_WIDTH}"].`,
      },
      height: {
        type: 'integer',
        minimum: 100,
        maximum: MAX_SIDE,
        description:
          'The viewport height. Default: the height of the content. Give one for an overlay (modal, drawer, toast), which sits on the viewport.',
      },
      mode: { type: 'string', enum: [...MODES], description: 'light (default) or dark.' },
      theme: {
        type: 'string',
        description:
          'A named theme of the installed styles (data-theme-name). Default: the base theme, the page with no data-theme-name.',
      },
      lang: {
        type: 'string',
        description:
          'The lang of the page, such as "it": the components localise their own texts from it.',
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      magma: string,
      mode: string,
      theme: string,
      preview: {
        type: 'object',
        properties: {
          pattern: string,
          case: string,
          rule: string,
          example: { type: 'integer' },
          file: string,
          try: string,
        },
        required: ['pattern', 'file'],
      },
      representative: { type: 'boolean' },
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
            file: string,
            representative: { type: 'boolean' },
            problems: {
              type: 'array',
              items: {
                type: 'object',
                properties: { kind: string, element: string, detail: string },
                required: ['kind', 'detail'],
              },
            },
          },
          required: ['width', 'height', 'file', 'representative', 'problems'],
        },
      },
    },
    required: ['magma', 'mode', 'representative', 'images'],
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  run: async ({
    markup,
    widths,
    height,
    mode = 'light',
    theme,
    lang,
    pattern,
    case: caseId,
    rule,
    example,
  }) => {
    const byCase =
      pattern !== undefined || caseId !== undefined || rule !== undefined || example !== undefined;
    if (byCase && markup !== undefined)
      throw new ToolError('Give markup, or pattern and case: not both.');
    if (caseId !== undefined && rule !== undefined)
      throw new ToolError('Give case or rule: not both.');
    const id = caseId ?? rule;
    if (byCase && (typeof pattern !== 'string' || typeof id !== 'string'))
      throw new ToolError(
        'Give both pattern and case, to render the preview of a case, or pattern and rule for a rule of a domain.',
      );
    if (example !== undefined && (!Number.isInteger(example) || (example as number) < 1))
      throw new ToolError('example is a whole number from 1, the first example.');
    const shipped = byCase
      ? shippedPreview(
          context,
          String(pattern),
          { kind: rule !== undefined ? 'rule' : 'case', id: String(id) },
          (example as number | undefined) ?? 1,
        )
      : undefined;
    if (!shipped && (typeof markup !== 'string' || !markup.trim()))
      throw new ToolError('Give the markup to render, or pattern and case.');
    if (!MODES.includes(mode as (typeof MODES)[number]))
      throw new ToolError(`mode is ${MODES.join(' or ')}.`);
    if (theme !== undefined) {
      const themes = themesOf(context);
      if (!themes.includes(String(theme)))
        throw new ToolError(
          themes.length
            ? `No theme ${String(theme)}: the installed styles name ${themes.join(', ')}.`
            : 'The installed styles have no named theme (dist/css/themes.css).',
        );
    }
    if (lang !== undefined && !/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(String(lang)))
      throw new ToolError(`lang is a language tag, such as "it" or "en-GB": not ${String(lang)}.`);
    if (
      height !== undefined &&
      (!Number.isInteger(height) || (height as number) < 100 || (height as number) > MAX_SIDE)
    )
      throw new ToolError(`height is a whole number of pixels from 100 to ${MAX_SIDE}.`);

    const breakpoints = breakpointsOf(context);
    const asked: unknown[] = Array.isArray(widths) && widths.length ? widths : [DEFAULT_WIDTH];
    if (asked.length > MAX_IMAGES)
      throw new ToolError(`At most ${MAX_IMAGES} widths in one render.`);
    const sizes = asked.map((one) => {
      const size = typeof one === 'string' && !/^\d+$/.test(one) ? breakpoints[one] : Number(one);
      if (size === undefined)
        throw new ToolError(
          `No breakpoint ${String(one)}: the installed styles name ${Object.keys(breakpoints).join(', ') || 'none'}; or give pixels.`,
        );
      if (!Number.isInteger(size) || size < MIN_WIDTH || size > MAX_SIDE)
        throw new ToolError(
          `A width is from ${MIN_WIDTH} to ${MAX_SIDE} pixels: not ${String(one)}.`,
        );
      return size;
    });

    const pageHeight = typeof height === 'number' ? height : shipped?.height;
    const pageLang = typeof lang === 'string' ? lang : shipped ? PREVIEW_LANG : undefined;
    const images = await render(context, {
      markup: shipped ? shipped.markup : String(markup),
      widths: sizes,
      ...(pageHeight !== undefined ? { height: pageHeight } : {}),
      ...(shipped?.wholePage ? { wholePage: true } : {}),
      mode: mode as (typeof MODES)[number],
      ...(typeof theme === 'string' ? { theme } : {}),
      ...(pageLang ? { lang: pageLang } : {}),
    });
    const version =
      readJsonFile<{ version: string }>(path.join(magmaRoot(context.settings), 'package.json'))
        ?.version ?? 'unknown';
    return withImages(
      {
        magma: version,
        mode: String(mode),
        ...(typeof theme === 'string' ? { theme } : {}),
        ...(shipped
          ? {
              preview: {
                pattern: shipped.pattern,
                [rule !== undefined ? 'rule' : 'case']: shipped.id,
                ...(shipped.example > 1 ? { example: shipped.example } : {}),
                file: path.relative(context.root, shipped.file),
                ...(shipped.try ? { try: shipped.try } : {}),
              },
            }
          : {}),
        representative: images.every((one) => one.representative),
        images: images.map(({ width, height, file, representative, problems }) => ({
          width,
          height,
          file,
          representative,
          problems,
        })),
      },
      images.map((one) => ({ data: one.png.toString('base64'), mimeType: 'image/png' })),
    );
  },
});
