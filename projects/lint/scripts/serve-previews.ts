/*
  serve.previews (#1220): the previews of the cases (docs/agents/patterns/previews, #1186) and
  the drafts not chosen yet (.claude/previews, untracked), served on the local build to edit
  them live: open a file in the editor, save it, and the browser shows the page again.

  The page of a stage is the page render_preview renders (pageOf and fileOf of
  ../src/mcp/render.ts): the stylesheets in the order and the layers of agents/assets.md, the
  loader of the components, the mi/, mdi/ and mgg/ icons from the packages. In this
  repository the packages are the workspace, so the build of projects/stencil and
  projects/styles. One page for both, never a second copy of it: what is fixed here is what
  the agents compare their markup with.

  The page around it shows the list, the stage in a frame and its `try` line under it, as the
  docs site does (docs/PATTERNS.md, "The preview of a case"). The frame is the viewport of
  render_preview: as wide as the width asked, as tall as the `height` of the preview or else
  as its content, up to the longest side of an image. The mode is set in the page as a
  controller sets it (`prefMode` of pageOf), since a frame takes the prefers-color-scheme of
  the system. A watch on the folders sends each change to the page through server-sent
  events, and the page loads the stage again: no extension of the editor.

  A drafts folder holds the options of a decision before the choice (the pattern-preview
  skill): <folder>/<name>.html, in the format of a preview, checked only as a file, since it
  is the stage of no case yet.
*/
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  watch,
  writeFileSync,
  type FSWatcher,
} from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parsePreview, type Preview } from '../src/core/patterns.js';
import { resolvePackage, type ToolContext } from '../src/mcp/context.js';
import {
  breakpointsOf,
  DEFAULT_WIDTH,
  fileOf,
  MAX_SIDE,
  MIN_WIDTH,
  MODES,
  pageOf,
  PREVIEW_LANG,
  TAILWIND,
  tailwindOf,
  themesOf,
  TYPES,
} from '../src/mcp/render.js';

/** The root of this repository. */
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** The folders served, by the name that opens the key of each stage. */
export const SOURCES = {
  previews: 'docs/agents/patterns/previews',
  drafts: '.claude/previews',
} as const;
export type SourceName = keyof typeof SOURCES;

/** The port when none is asked: one no other server of the repository takes (6006 Storybook, 5177 the tokens playground). */
export const PORT = 5180;

export interface Stage {
  /** `<source>/<folder>/<name>`, the path of the stage in the server. */
  key: string;
  source: SourceName;
  file: string;
}

export interface Options {
  context: ToolContext;
  /** The folder of each source. */
  dirs: Record<SourceName, string>;
  port?: number;
  /** How long the watch waits for the writes of one save to end. */
  settle?: number;
}

const SEGMENT = /^[\w-][\w.-]*$/;

/**
 * Every stage of the folders, by source, folder and name: <folder>/<name>.html; the examples of a
 * case or a rule after it, in their order (<id>.2.html, <id>.10.html, #1221).
 */
export const listStages = (dirs: Options['dirs']): Stage[] =>
  (Object.keys(SOURCES) as SourceName[]).flatMap((source) => {
    const dir = dirs[source];
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter((one) => one.isDirectory() && SEGMENT.test(one.name))
      .map((one) => one.name)
      .sort()
      .flatMap((folder) =>
        readdirSync(path.join(dir, folder))
          .filter((name) => name.endsWith('.html') && SEGMENT.test(name))
          .map((name) => name.slice(0, -'.html'.length))
          .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
          .map((name) => ({
            key: `${source}/${folder}/${name}`,
            source,
            file: path.join(dir, folder, `${name}.html`),
          })),
      );
  });

/** The stage of a key, or undefined: a key names a source and two plain segments, never a way out of them. */
const stageOf = (dirs: Options['dirs'], key: string): Stage | undefined => {
  const [source, folder, name, ...rest] = key.split('/');
  if (
    rest.length ||
    !Object.hasOwn(SOURCES, source!) ||
    !SEGMENT.test(folder ?? '') ||
    !SEGMENT.test(name ?? '')
  )
    return undefined;
  const file = path.join(dirs[source as SourceName], folder!, `${name}.html`);
  return existsSync(file) ? { key, source: source as SourceName, file } : undefined;
};

/** The view asked in the query: the mode, the theme and the width, as render_preview takes them. */
export interface View {
  mode: (typeof MODES)[number];
  theme?: string;
  width: string;
  pixels: number;
  errors: string[];
}

const viewOf = (context: ToolContext, query: URLSearchParams): View => {
  const errors: string[] = [];
  const mode = query.get('mode') ?? 'light';
  const theme = query.get('theme') || undefined;
  const width = query.get('width') || DEFAULT_WIDTH;
  if (!MODES.includes(mode as View['mode'])) errors.push(`mode is ${MODES.join(' or ')}.`);
  const themes = themesOf(context);
  if (theme && !themes.includes(theme))
    errors.push(`No theme ${theme}: the styles name ${themes.join(', ') || 'none'}.`);
  const breakpoints = breakpointsOf(context);
  const pixels = /^\d+$/.test(width) ? Number(width) : breakpoints[width];
  if (pixels === undefined || pixels < MIN_WIDTH || pixels > MAX_SIDE)
    errors.push(
      `A width is a breakpoint (${Object.keys(breakpoints).join(', ')}) or pixels from ${MIN_WIDTH} to ${MAX_SIDE}: not ${width}.`,
    );
  return {
    mode: MODES.includes(mode as View['mode']) ? (mode as View['mode']) : 'light',
    ...(theme && themes.includes(theme) ? { theme } : {}),
    width,
    pixels:
      pixels !== undefined && pixels >= MIN_WIDTH && pixels <= MAX_SIDE
        ? pixels
        : (breakpoints[DEFAULT_WIDTH] ?? 1024),
    errors,
  };
};

/** The query of a view, the defaults left out. */
const queryOf = (view: View): string => {
  const query = new URLSearchParams();
  if (view.mode !== 'light') query.set('mode', view.mode);
  if (view.theme) query.set('theme', view.theme);
  if (view.width !== DEFAULT_WIDTH) query.set('width', view.width);
  const text = query.toString();
  return text ? `?${text}` : '';
};

/** The file of the entry point of the editor, in the drafts folder. */
export const EDITOR_ENTRY = 'tailwind.css';

/**
 * The Tailwind entry point of the editor, for Tailwind CSS IntelliSense
 * (`tailwindCSS.experimental.configFile`, docs/EDITOR_TOKENS.md): `TAILWIND`, each import
 * resolved to the file the page compiles, so the editor completes the very classes the page
 * gives rules to, on the build of the server, whatever the checkout the editor has open. A
 * file of this machine, untracked: whole paths.
 */
export const editorEntryOf = (context: ToolContext): string =>
  `/* Written by nx run lint:serve.previews from TAILWIND (projects/lint/src/mcp/render.ts):
   the Tailwind entry point of a stage, for the editor (docs/EDITOR_TOKENS.md). */
${TAILWIND.replace(/@import '([^']+)'/g, (whole, id: string) => {
  const file = resolvePackage(context, id);
  return file ? `@import '${file}'` : whole;
})}
`;

/** The page of a stage: the page of render_preview, its Tailwind classes compiled, in the mode and the theme asked. */
export const stagePage = async (
  context: ToolContext,
  preview: Preview,
  view: Pick<View, 'mode' | 'theme'>,
): Promise<string> => {
  const utilities = await tailwindOf(context, preview.markup);
  return pageOf(context, {
    markup: preview.markup,
    ...(preview.wholePage ? { wholePage: true } : {}),
    prefMode: view.mode,
    ...(view.theme ? { theme: view.theme } : {}),
    lang: PREVIEW_LANG,
    ...(utilities ? { utilities } : {}),
  });
};

const escape = (text: string): string =>
  text.replace(/[&<>"']/g, (one) => `&#${one.charCodeAt(0)};`);

/**
 * The path of a file as the explorer of the editor shows it: from the root of the checkout that
 * holds it, the nearest folder with a `.git` (a folder, or the file of a worktree), not from
 * the checkout of the server: the drafts may live in another one (`--drafts`). A file in no
 * checkout keeps its whole path.
 */
export const repoPath = (file: string): string => {
  const whole = path.resolve(file);
  for (let dir = path.dirname(whole); dir !== path.dirname(dir); dir = path.dirname(dir))
    if (existsSync(path.join(dir, '.git'))) return path.relative(dir, whole);
  return whole;
};

/**
 * The file of a stage, a link that opens it in VS Code: `vscode://file/<full path>`
 * (code.visualstudio.com, "Opening VS Code with URLs"); the full path only in the link, the
 * path shown is the one of the repository (`repoPath`).
 */
export const fileLink = (file: string): string =>
  `<mds-link href="vscode://file${encodeURI(path.resolve(file))}" icon="mi/baseline/open-in-new" label="${escape(repoPath(file))}"></mds-link>`;

/**
 * The page around the stages, itself a page of Magma: the chrome is markup with Magma
 * components and Tailwind classes, served on `pageOf` as a stage is (no inset, the mode of the
 * system), so it needs no stylesheet of its own. The list, the stage asked in its frame, what
 * to try in it and what is wrong in its file.
 */
const framePage = async (
  context: ToolContext,
  dirs: Options['dirs'],
  view: View,
  stage?: { key: string; preview: Preview },
  missing?: string,
): Promise<string> => {
  const query = queryOf(view);
  const stages = listStages(dirs);
  const list = (Object.keys(SOURCES) as SourceName[])
    .map((source) => {
      const mine = stages.filter((one) => one.source === source);
      const folders = [...new Set(mine.map((one) => one.key.split('/')[1]!))];
      const items = folders
        .map(
          (folder) => `<div class="grid gap-100">
<mds-text typography="label" tag="h3">${escape(folder)}</mds-text>
<ul class="m-0 grid list-none gap-100 p-0">${mine
            .filter((one) => one.key.split('/')[1] === folder)
            .map((one) =>
              one.key === stage?.key
                ? `<li aria-current="page"><mds-text typography="action">${escape(one.key.split('/')[2]!)}</mds-text></li>`
                : `<li><mds-text typography="detail"><mds-link href="/view/${one.key}${query}">${escape(one.key.split('/')[2]!)}</mds-link></mds-text></li>`,
            )
            .join('')}</ul>
</div>`,
        )
        .join('');
      return `<section class="grid gap-title-content">
<div class="grid">
<mds-text typography="h6" tag="h2">${source}</mds-text>
<mds-text typography="caption" tag="p" class="break-all text-fg-muted">${escape(repoPath(dirs[source]))}</mds-text>
</div>
${items ? `<div class="grid gap-300">${items}</div>` : '<mds-text typography="detail" tag="p">None yet.</mds-text>'}
</section>`;
    })
    .join('');
  const breakpoints = Object.entries(breakpointsOf(context)).sort((a, b) => a[1] - b[1]);
  const widths = breakpoints.some(([name]) => name === view.width)
    ? breakpoints
    : [...breakpoints, [view.width, view.pixels] as [string, number]];
  const option = (value: string, label: string) =>
    `<option value="${escape(value)}">${escape(label)}</option>`;
  const select = (label: string, name: string, value: string, options: string) =>
    `<mds-input-field label="${label}" class="w-3xs"><mds-input-select name="${name}" value="${escape(value)}">${options}</mds-input-select></mds-input-field>`;
  const toolbar = `<div class="flex flex-wrap items-end gap-400">
${select('Mode', 'mode', view.mode, MODES.map((one) => option(one, one)).join(''))}
${select(
  'Theme',
  'theme',
  view.theme ?? '',
  option('', 'default') +
    themesOf(context)
      .map((one) => option(one, one))
      .join(''),
)}
${select('Width', 'width', view.width, widths.map(([name, pixels]) => option(name, /^\d+$/.test(name) ? `${pixels} px` : `${name} (${pixels} px)`)).join(''))}
</div>`;
  const info = (preview?: Preview) => {
    const errors = [...view.errors, ...(preview?.errors ?? [])];
    return `<div id="info" class="grid gap-300">
${preview?.try ? `<mds-text typography="detail" tag="p">${escape(preview.try)}</mds-text>` : ''}
${errors.length ? `<mds-banner variant="error" headline="What is wrong">${errors.map((one) => `<mds-text typography="detail" tag="p">${escape(one)}</mds-text>`).join('')}</mds-banner>` : ''}
<mds-banner id="cut" variant="warning" class="hidden" headline="Taller than an image">The content is taller than ${MAX_SIDE} px: render_preview shows its first ${MAX_SIDE}.</mds-banner>
</div>`;
  };
  // every stage with its file, on the page that shows none
  const files = `<mds-table class="w-full">
<mds-table-header><mds-table-header-cell label="Stage"></mds-table-header-cell><mds-table-header-cell label="File"></mds-table-header-cell></mds-table-header>
<mds-table-body>${stages
    .map(
      (one) =>
        `<mds-table-row><mds-table-cell><mds-text typography="detail"><mds-link href="/view/${one.key}${query}">${escape(one.key)}</mds-link></mds-text></mds-table-cell><mds-table-cell><mds-text typography="detail">${fileLink(one.file)}</mds-text></mds-table-cell></mds-table-row>`,
    )
    .join('')}</mds-table-body>
</mds-table>`;
  const header = (title: string, line: string) => `<header class="grid gap-title-content">
<mds-text typography="h4" tag="h1">${escape(title)}</mds-text>
<mds-text typography="detail" tag="p">${line}</mds-text>
</header>`;
  const main = stage
    ? `${header(stage.key, fileLink(stage.preview.file))}
${toolbar}
<div class="overflow-auto"><iframe id="stage" class="block border border-dashed border-border-default" title="${escape(stage.key)}" src="/stage/${stage.key}${query}" data-key="${escape(stage.key)}" data-height="${stage.preview.height ?? 'auto'}" style="width: ${view.pixels}px; height: ${stage.preview.height ?? 0}px"></iframe></div>
${info(stage.preview)}`
    : missing
      ? header(missing, 'No such stage: it was moved or deleted.')
      : `${header('serve.previews', 'Choose a stage. Edit its file and save: the page shows it again.')}
${toolbar}
${files}`;
  const chrome = `<title>${escape(stage?.key ?? missing ?? 'serve.previews')}</title>
<div class="grid min-h-dvh grid-cols-[16rem_1fr]">
<nav aria-label="Stages" class="flex flex-col gap-between-groups overflow-auto border-e border-border-muted bg-surface-sunken p-inset">${list}</nav>
<main class="grid min-w-0 content-start gap-between-groups p-inset">${main}</main>
</div>
<script>
${clientScript}
</script>`;
  const utilities = await tailwindOf(context, chrome);
  return pageOf(context, {
    markup: chrome,
    wholePage: true,
    lang: 'en',
    ...(utilities ? { utilities } : {}),
  });
};

/**
 * The script of the page around the stages: the view from the selects, the height of the
 * frame, and the stage loaded again when its file changes, the page when a stage is added or
 * removed.
 */
const clientScript = `for (const select of document.querySelectorAll('mds-input-select[name]'))
  select.addEventListener('mdsInputSelectChange', (event) => {
    const name = select.getAttribute('name');
    const query = new URLSearchParams(location.search);
    if ((query.get(name) ?? select.getAttribute('value')) === event.detail.value) return;
    if (event.detail.value) query.set(name, event.detail.value);
    else query.delete(name);
    location.search = query.toString();
  });
const stage = document.getElementById('stage');
const MAX = ${MAX_SIDE};
const fit = () => {
  if (!stage || stage.dataset.height !== 'auto') return;
  const root = stage.contentDocument && stage.contentDocument.getElementById('magma-preview');
  if (!root) return;
  const height = Math.ceil(root.getBoundingClientRect().bottom + stage.contentWindow.scrollY);
  stage.style.height = Math.min(height, MAX) + 'px';
  document.getElementById('cut').classList.toggle('hidden', height <= MAX);
};
if (stage)
  stage.addEventListener('load', () => {
    const root = stage.contentDocument.getElementById('magma-preview');
    if (root) new stage.contentWindow.ResizeObserver(fit).observe(root);
    fit();
  });
const events = new EventSource('/events');
events.addEventListener('message', async (event) => {
  const change = JSON.parse(event.data);
  if (change.type === 'list') return location.reload();
  if (!stage || change.key !== stage.dataset.key) return;
  const fresh = new DOMParser().parseFromString(await (await fetch(location.href)).text(), 'text/html');
  const next = fresh.getElementById('stage');
  if (!next) return location.reload();
  document.getElementById('info').replaceWith(fresh.getElementById('info'));
  stage.dataset.height = next.dataset.height;
  if (next.dataset.height !== 'auto') stage.style.height = next.dataset.height + 'px';
  stage.contentWindow.location.reload();
});`;

const send = (
  response: ServerResponse,
  status: number,
  body: string | Buffer,
  type = 'text/html; charset=utf-8',
) => {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  response.end(body);
};

export interface PreviewServer {
  url: string;
  close: () => Promise<void>;
}

/** Serve the stages, watch their folders, and tell the pages what changed. */
export const servePreviews = async ({
  context,
  dirs,
  port = PORT,
  settle = 60,
}: Options): Promise<PreviewServer> => {
  const clients = new Set<ServerResponse>();
  const broadcast = (
    change: { type: 'change'; key: string } | { type: 'list'; keys: string[] },
  ) => {
    for (const client of clients) client.write(`data: ${JSON.stringify(change)}\n\n`);
  };

  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/events') {
      response.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-store',
        connection: 'keep-alive',
      });
      response.write('retry: 1000\n\n');
      clients.add(response);
      request.on('close', () => clients.delete(response));
      return;
    }
    const view = viewOf(context, url.searchParams);
    if (pathname === '/') return send(response, 200, await framePage(context, dirs, view));
    for (const [prefix, page] of [
      ['/view/', 'frame'],
      ['/stage/', 'stage'],
    ] as const)
      if (pathname.startsWith(prefix)) {
        const key = pathname.slice(prefix.length);
        const stage = stageOf(dirs, key);
        if (!stage)
          return send(
            response,
            404,
            page === 'frame' ? await framePage(context, dirs, view, undefined, key) : '',
          );
        const preview = parsePreview(readFileSync(stage.file, 'utf8'), stage.file);
        return send(
          response,
          200,
          page === 'frame'
            ? await framePage(context, dirs, view, { key, preview })
            : await stagePage(context, preview, view),
        );
      }
    // what the page of render_preview loads: the components, the icons, the stylesheets
    const file = fileOf(context, pathname);
    if (!file) return send(response, 404, '', 'text/plain');
    send(
      response,
      200,
      readFileSync(file),
      TYPES[path.extname(file)] ?? 'application/octet-stream',
    );
  };
  const server = createServer((request, response) => {
    handle(request, response).catch((error: unknown) =>
      send(response, 500, String((error as Error).stack ?? error), 'text/plain; charset=utf-8'),
    );
  });

  // the entry point of the editor, beside the drafts, rewritten only when it changes
  mkdirSync(dirs.drafts, { recursive: true });
  const entry = path.join(dirs.drafts, EDITOR_ENTRY);
  const text = editorEntryOf(context);
  if (!existsSync(entry) || readFileSync(entry, 'utf8') !== text) writeFileSync(entry, text);

  // one save may be several writes: each key is told once they end, the list when it changed
  let known = new Set(listStages(dirs).map((one) => one.key));
  const timers = new Map<string, NodeJS.Timeout>();
  const watchers: FSWatcher[] = (Object.keys(SOURCES) as SourceName[]).map((source) => {
    mkdirSync(dirs[source], { recursive: true });
    return watch(dirs[source], { recursive: true }, (_, filename) => {
      if (!filename?.endsWith('.html')) return;
      const key = `${source}/${filename.split(path.sep).join('/').slice(0, -'.html'.length)}`;
      clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          const now = new Set(listStages(dirs).map((one) => one.key));
          if (now.size !== known.size || [...now].some((one) => !known.has(one))) {
            known = now;
            broadcast({ type: 'list', keys: [...now] });
          } else broadcast({ type: 'change', key });
        }, settle),
      );
    });
  });

  await new Promise<void>((done, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', done);
  });
  const { port: bound } = server.address() as AddressInfo;
  return {
    url: `http://localhost:${bound}/`,
    close: async () => {
      for (const watcher of watchers) watcher.close();
      for (const timer of timers.values()) clearTimeout(timer);
      for (const client of clients) client.end();
      await new Promise<void>((done) => server.close(() => done()));
    },
  };
};

/** The command: nx run lint:serve.previews [-- --port <n>] [--previews <dir>] [--drafts <dir>]. */
const main = async () => {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const at = args.indexOf(`--${name}`);
    return at >= 0 ? args[at + 1] : undefined;
  };
  const dirs = Object.fromEntries(
    (Object.keys(SOURCES) as SourceName[]).map((source) => [
      source,
      path.resolve(REPO, option(source) ?? SOURCES[source]),
    ]),
  ) as Options['dirs'];
  const context: ToolContext = { root: REPO, settings: {} };
  let loader: string | undefined;
  try {
    loader = fileOf(context, '/components/magma-components.esm.js');
  } catch {
    // no dist/documentation.json: magma is not built
  }
  if (!loader) {
    console.error(
      'The components are not built: nx run stencil:build (or build.watch), then again.',
    );
    process.exit(1);
  }
  const port = Number(option('port') ?? PORT);
  const server = await servePreviews({ context, dirs, port }).catch(
    (error: NodeJS.ErrnoException) => {
      console.error(
        error.code === 'EADDRINUSE'
          ? `Port ${port} is taken: nx run lint:serve.previews -- --port <another>`
          : error,
      );
      process.exit(1);
    },
  );
  const stages = listStages(dirs);
  console.info(`serve.previews: ${server.url}`);
  for (const source of Object.keys(SOURCES) as SourceName[])
    console.info(
      `  ${source.padEnd(9)}${repoPath(dirs[source])} (${stages.filter((one) => one.source === source).length})`,
    );
  console.info(
    `  magma    ${path.relative(REPO, path.dirname(path.dirname(loader)))}, the local build`,
  );
  console.info('Edit a stage and save it: the page shows it again. Ctrl+C to stop.');
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main();
