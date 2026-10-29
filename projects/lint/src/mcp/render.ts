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
  case of a pattern (agents/patterns/previews/<pattern>/<case>.html, #1186), with the height of
  its page and the language of its words, so the check of the image runs on every preview.
*/
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { magmaRoot } from '../core/data.js';
import { indexPatterns, previewOf, readPatternDir, readPreviews } from '../core/patterns.js';
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

/** `@fontsource/karla/400.css` -> `@fontsource/karla`. */
const packageOf = (module: string): string => {
  const [first, second] = module.split('/');
  return first!.startsWith('@') ? `${first}/${second}` : first!;
};

/** The lazy loader of the components, in the magma package: what a <script type="module"> loads. */
const LOADER = 'dist/magma-components/magma-components.esm.js';

/** The loader of the context (the tests), else the one of the installed magma; its chunks sit beside it. */
const loaderOf = (context: ToolContext): string =>
  context.loader ?? path.join(magmaRoot(context.settings), LOADER);

/** The path mds-icon fetches the icons from, set the way agents/assets.md gives (the sessionStorage key). */
const ICON_PATH = '/svg/';

export const MODES = ['light', 'dark'] as const;

/**
 * The longest side of an image: Claude Code caps an image of a tool result at 2000 px a side
 * (CHANGELOG 2.1.122), as the Anthropic API does for a request with many images (vision docs).
 * Four images of that size stay under the 25,000 tokens Claude Code allows a tool result.
 */
export const MAX_SIDE = 2000;
export const MAX_IMAGES = 4;
const MIN_WIDTH = 320;

/** A stylesheet of the installed styles, or undefined. */
const stylesOf = (context: ToolContext, name: string): string | undefined => {
  const dir = packageDir(context, '@maggioli-design-system/styles');
  const file = dir && path.join(dir, 'dist/css', name);
  return file && existsSync(file) ? readFileSync(file, 'utf8') : undefined;
};

/** The named themes of the installed styles: the values of `data-theme-name` themes.css styles. */
export const themesOf = (context: ToolContext): string[] => [
  ...new Set(
    [...(stylesOf(context, 'themes.css') ?? '').matchAll(/\[data-theme-name=['"]?([\w-]+)/g)].map(
      (one) => one[1]!,
    ),
  ),
];

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
const fileOf = (context: ToolContext, pathname: string): string | undefined => {
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

const TYPES: Record<string, string> = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/** The page: the stylesheets of a consumer, the loader of the components, the markup. */
const pageOf = (context: ToolContext, options: Options): string => {
  // each module as Node resolves it from the project: a bare `normalize.css` is its main file
  const imports = STYLESHEETS.flatMap(({ module, layer }) => {
    const file = resolvePackage(context, module);
    const dir = packageDir(context, packageOf(module));
    if (!file || !dir) return [];
    const url = `/node_modules/${packageOf(module)}/${path.relative(dir, file).split(path.sep).join('/')}`;
    return [`@import url('${url}') layer(${layer});`];
  });
  const lang = options.lang ? ` lang="${options.lang}"` : '';
  const theme = options.theme ? ` data-theme-name="${options.theme}"` : '';
  return `<!doctype html>
<html${lang}${theme}>
<head>
<meta charset="utf-8">
<style>
${LAYERS}
${imports.join('\n')}
#${PREVIEW_ID} { display: flow-root; padding: 24px; }
</style>
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
  mode: (typeof MODES)[number];
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

/** One page at one width: the image and what is wrong in it. */
const capture = async (
  context: ToolContext,
  browser: Browser,
  html: string,
  width: number,
  options: Options,
): Promise<{ png: Buffer; height: number; problems: PageProblem[] }> => {
  const session = await browser.newContext({
    viewport: { width, height: options.height ?? 600 },
    deviceScaleFactor: 1,
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
    // mds-icon reads its path before the first icon renders; Stencil emits appload once the
    // components of the first load are ready (./render-page.ts); `__name` is the helper a
    // TypeScript runner that keeps function names (tsx) puts in the source sent to the page
    await session.addInitScript(
      `sessionStorage.setItem('mdsIconSvgPath', '${ICON_PATH}');
addEventListener('appload', () => { window.magmaAppLoaded = true; });
globalThis.__name = (fn) => fn;`,
    );
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
    const height = options.height ?? Math.min(inspection.height, MAX_SIDE);
    if (!options.height) {
      // the viewport as tall as the content: a layout that depends on the height settles again
      await page.setViewportSize({ width, height });
      await page.evaluate(inPage, { step: 'settle', timeout: Math.min(2000, timeout / 2) });
      inspection = (await page.evaluate(inPage, { step: 'inspect' })) as Inspection;
    }
    if (!options.height && inspection.height > MAX_SIDE)
      problems.push({
        kind: 'cut',
        detail: `The content is ${inspection.height} px tall and the image shows its first ${MAX_SIDE}: render a part of it, or each part on its own.`,
      });
    const png = await page.screenshot({ type: 'png' });
    const flat = (await page.evaluate(inPage, {
      step: 'pixels',
      png: png.toString('base64'),
      scale: 1,
      regions: inspection.regions,
    })) as PageProblem[];
    const all = [...problems, ...inspection.problems, ...flat];
    // one problem once: a component asks for a missing icon on each render
    const seen = new Set<string>();
    const unique = all.filter((one) => {
      const key = JSON.stringify(one);
      return !seen.has(key) && seen.add(key);
    });
    return { png, height, problems: unique };
  } finally {
    await session.close();
  }
};

/** Render the markup at each width: the image, the file it is written to and what is wrong in it. */
export const render = async (
  context: ToolContext,
  options: Options,
): Promise<Array<Image & { png: Buffer }>> => {
  const chromium = await chromiumOf(context);
  if (!chromium)
    throw new ToolError(
      'render_preview needs playwright-core in the project: npm i -D playwright-core. It drives the Google Chrome or Microsoft Edge of the machine and downloads no browser (agents/mcp.md, "Show the person what you mean").',
    );
  if (!existsSync(loaderOf(context)))
    throw new ToolError(`The installed magma has no ${LOADER}: the components cannot load.`);
  const version =
    readJsonFile<{ version: string }>(path.join(magmaRoot(context.settings), 'package.json'))
      ?.version ?? '';
  const html = pageOf(context, options);
  const out = path.join(context.root, PREVIEW_DIR);
  mkdirSync(out, { recursive: true });
  // the same markup, options and magma give the same file, written again: the time a page
  // may take is no part of what it shows
  const id = createHash('sha256')
    .update(JSON.stringify({ ...options, timeout: undefined, version }))
    .digest('hex')
    .slice(0, 12);

  const browser = await launch(chromium);
  try {
    const images: Array<Image & { png: Buffer }> = [];
    for (const width of options.widths) {
      const { png, height, problems } = await capture(context, browser, html, width, options);
      const file = path.join(out, `${id}-${width}-${options.mode}.png`);
      writeFileSync(file, png);
      images.push({ width, height, file, png, representative: !problems.length, problems });
    }
    return images;
  } finally {
    await browser.close();
  }
};

const string = { type: 'string' };

/**
 * The preview of a case Magma ships, by the id of its pattern (an old one too) and of its case;
 * the words of the previews are Italian, as the examples of the components (docs/PATTERNS.md).
 */
const PREVIEW_LANG = 'it';
const shippedPreview = (context: ToolContext, pattern: string, id: string) => {
  const dir = path.join(magmaRoot(context.settings), 'agents', 'patterns');
  const { byId, aliases } = indexPatterns(readPatternDir(dir).map((one) => one.data));
  const realId = byId.has(pattern) ? pattern : aliases.get(pattern);
  if (!realId)
    throw new ToolError(
      `No pattern ${pattern} in this magma: the patterns are ${[...byId.keys()].join(', ')}.`,
    );
  const previews = readPreviews(dir).filter((one) => one.pattern === realId);
  const found = previewOf(previews, realId, id);
  if (!found)
    throw new ToolError(
      previews.length
        ? `No preview of the case ${id} of ${realId}: the cases with one are ${previews.map((one) => one.case).join(', ')}.`
        : `${realId} has no preview of its cases in this magma yet.`,
    );
  return found;
};

export const renderPreview = (context: ToolContext): Tool => ({
  name: 'render_preview',
  title: 'Render Magma markup as an image',
  description:
    'Render HTML with Magma components on the magma installed in the project, offline, and get the image (to look at, and to show the person) with its file, and a report of what in it is not representative: a component unknown or not hydrated, an element with no size, a component that shows one flat colour, a console error, an icon, a font or an image that did not load, a word broken across lines, content cut. Instead of markup, pattern and case render the preview Magma ships for that case of a pattern. Render each option before asking a person to decide on an interface. Needs playwright-core in the project and Chrome or Edge on the machine; writes the image into node_modules/.cache/magma/previews.',
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
          'With pattern: one of its cases, such as "action-failed-in-place"; its preview is rendered with the height and the language it declares.',
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
          'A named theme of the installed styles (data-theme-name). Default: the default theme.',
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
        properties: { pattern: string, case: string, file: string, try: string },
        required: ['pattern', 'case', 'file'],
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
  run: async ({ markup, widths, height, mode = 'light', theme, lang, pattern, case: caseId }) => {
    const byCase = pattern !== undefined || caseId !== undefined;
    if (byCase && markup !== undefined)
      throw new ToolError('Give markup, or pattern and case: not both.');
    if (byCase && (typeof pattern !== 'string' || typeof caseId !== 'string'))
      throw new ToolError('Give both pattern and case, to render the preview of a case.');
    const shipped = byCase ? shippedPreview(context, String(pattern), String(caseId)) : undefined;
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
                case: shipped.case,
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
