// serve.previews (#1220): the page of a stage is the page of render_preview, the frame around
// it honours the header of the preview and the view asked, and a saved file reloads the stage.
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { parsePreview } from '@maggioli-design-system/magma/lint';
import {
  breakpointsOf,
  INIT_SCRIPT,
  pageOf,
  PREVIEW_LANG,
  render,
  STYLESHEETS,
  TAILWIND,
  tailwindOf,
  themesOf,
} from '../src/render.js';
import {
  EDITOR_ENTRY,
  editorEntryOf,
  listStages,
  servePreviews,
  type PreviewServer,
} from '../scripts/serve-previews.js';
import { context, fixtures } from './mcp-context.js';

/** The two folders of stages, of their own so that a test may write in them: the previews of the fixtures and a draft. */
const stagesOf = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'magma-serve-'));
  const dirs = { previews: path.join(root, 'previews'), drafts: path.join(root, 'drafts') };
  // a checkout: the paths shown start at its root
  mkdirSync(path.join(root, '.git'));
  cpSync(path.join(fixtures, 'magma/agents/patterns/previews'), dirs.previews, {
    recursive: true,
  });
  mkdirSync(path.join(dirs.drafts, 'decision'), { recursive: true });
  copyFileSync(
    path.join(dirs.previews, 'message-placement/region-info.html'),
    path.join(dirs.drafts, 'decision/option-a.html'),
  );
  return { root, dirs };
};

type Change = { type: string; key?: string; keys?: string[] };

/** The events of the server, read from its stream until one matches. */
const eventsOf = async (url: string) => {
  const response = await fetch(`${url}events`);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  return {
    next: async (match: (event: Change) => boolean, timeout = 5000): Promise<Change> => {
      const deadline = Date.now() + timeout;
      for (;;) {
        let end = buffer.indexOf('\n\n');
        while (end >= 0) {
          const data = /^data: (.*)$/m.exec(buffer.slice(0, end))?.[1];
          buffer = buffer.slice(end + 2);
          if (data && match(JSON.parse(data) as Change)) return JSON.parse(data) as Change;
          end = buffer.indexOf('\n\n');
        }
        if (Date.now() > deadline) throw new Error('the server told no such change');
        const chunk = await Promise.race([
          reader.read(),
          new Promise<undefined>((done) => setTimeout(done, deadline - Date.now())),
        ]);
        if (chunk?.value) buffer += decoder.decode(chunk.value, { stream: true });
      }
    },
    close: () => reader.cancel(),
  };
};

describe('serve.previews', () => {
  // the stand-in loader of the fixtures, the styles and the icons installed in this repository
  const { root, dirs } = stagesOf();
  const loader = path.join(fixtures, 'components/magma-components.esm.js');
  const serveContext = { ...context, root, loader };
  let server: PreviewServer;
  beforeAll(async () => {
    server = await servePreviews({ context: serveContext, dirs, port: 0, settle: 20 });
  });
  afterAll(async () => {
    await server.close();
    rmSync(root, { recursive: true, force: true });
  });
  const get = (pathname: string) => fetch(new URL(pathname, server.url));
  const previewOf = (file: string) => parsePreview(readFileSync(file, 'utf8'), file);

  test('lists the stages of both folders, by source, folder and name', () => {
    expect(listStages(dirs).map((one) => one.key)).toEqual([
      'previews/message-placement/action-failed-in-place',
      'previews/message-placement/region-info',
      'previews/message-placement/region-info.2',
      'previews/rhythm/shared-inset',
      'drafts/decision/option-a',
    ]);
  });

  test('writes the Tailwind entry point of the editor beside the drafts, on the files the page compiles', () => {
    const entry = readFileSync(path.join(dirs.drafts, EDITOR_ENTRY), 'utf8');
    expect(entry).toBe(editorEntryOf(serveContext));
    // one import per import of TAILWIND, in its order, each the whole path of a file there is
    const ids = [...TAILWIND.matchAll(/@import '([^']+)'/g)].map((one) => one[1]!);
    const files = [...entry.matchAll(/@import '([^']+)'/g)].map((one) => one[1]!);
    expect(files).toHaveLength(ids.length);
    files.forEach((file, at) => {
      expect(path.isAbsolute(file) && existsSync(file)).toBe(true);
      expect(file.split(path.sep).join('/')).toMatch(
        new RegExp(`${ids[at]!.split('/').slice(-2).join('/').replace('.', '\\.')}$`),
      );
    });
    // the layers of the guide stay on their imports
    expect(entry).toContain("utilities.css' layer(utilities);");
    // not a stage
    expect(listStages(dirs).map((one) => one.key)).not.toContain('drafts/tailwind');
  });

  test('the page of a stage is the page of render_preview, in the mode and the theme asked', async () => {
    const preview = previewOf(path.join(dirs.previews, 'message-placement/region-info.html'));
    const theme = themesOf(serveContext)[0];
    const response = await get(
      `/stage/previews/message-placement/region-info?mode=dark${theme ? `&theme=${theme}` : ''}`,
    );
    expect(response.status).toBe(200);
    const page = await response.text();
    expect(page).toBe(
      pageOf(serveContext, {
        markup: preview.markup,
        prefMode: 'dark',
        ...(theme ? { theme } : {}),
        lang: PREVIEW_LANG,
        utilities: (await tailwindOf(serveContext, preview.markup))!,
      }),
    );
    // what render_preview loads: its first script, the loader, the stylesheets in their layers
    expect(page).toContain(INIT_SCRIPT);
    expect(page).toContain('<script type="module" src="/components/magma-components.esm.js">');
    expect(page).toMatch(/<html lang="it"[^>]* data-magma-pref class="pref-mode-dark">/);
    const layers = [...page.matchAll(/@import url\('[^']+'\) layer\((\w+)\);/g)].map(
      (one) => one[1],
    );
    expect(layers).toEqual(STYLESHEETS.map((one) => one.layer));
    // light when no mode is asked, the default of render_preview, set the same way
    expect(await (await get('/stage/previews/message-placement/region-info')).text()).toContain(
      'data-magma-pref class="pref-mode-light"',
    );
  });

  test('a draft is served as a preview is; a whole page gets no inset', async () => {
    const file = path.join(dirs.drafts, 'decision/whole.html');
    writeFileSync(
      file,
      '<!--\ntry: Look at the edge.\nwhole-page: true\n-->\n<mds-fixture class="p-0">Pagina</mds-fixture>\n',
    );
    try {
      const page = await (await get('/stage/drafts/decision/whole')).text();
      expect(page).toBe(
        pageOf(serveContext, {
          markup: previewOf(file).markup,
          wholePage: true,
          prefMode: 'light',
          lang: PREVIEW_LANG,
          utilities: (await tailwindOf(serveContext, previewOf(file).markup))!,
        }),
      );
      expect(page).toContain('#magma-preview { display: flow-root; padding: 0px; }');
      // its Tailwind classes compiled, as render_preview compiles them
      expect(page).toMatch(/\.p-0 \{\s*padding: 0px;/);
    } finally {
      rmSync(file);
    }
  });

  test('serves what the page loads, from where render_preview takes it, and nothing else', async () => {
    const component = await get('/components/magma-components.esm.js');
    expect(component.headers.get('content-type')).toBe('text/javascript');
    expect(await component.text()).toBe(readFileSync(loader, 'utf8'));
    const icon = await get('/svg/mgg/ricerca-avanzata.svg');
    expect(icon.headers.get('content-type')).toBe('image/svg+xml');
    expect(await icon.text()).toBe(
      readFileSync(path.join(fixtures, 'icons/mgg/ricerca-avanzata.svg'), 'utf8'),
    );
    const sheet = await get(`/node_modules/${STYLESHEETS.at(-1)!.module}`);
    expect(sheet.headers.get('content-type')).toBe('text/css');
    for (const pathname of [
      '/node_modules/eslint/package.json',
      '/svg/mgg/nope.svg',
      '/stage/previews/decision%2F..%2F..%2Fsecret',
      '/stage/toString/decision/option-a',
      '/stage/previews/message-placement/nope',
      '/view/previews/message-placement',
    ])
      expect({ pathname, status: (await get(pathname)).status }).toEqual({
        pathname,
        status: 404,
      });
  });

  test('every stage names its file from the root of its checkout, a link that opens it in VS Code', async () => {
    const draft = path.join(dirs.drafts, 'decision/option-a.html');
    const link = `<mds-link href="vscode://file${encodeURI(draft)}" icon="mi/baseline/open-in-new" label="drafts/decision/option-a.html"></mds-link>`;
    // the page that shows no stage lists them all, each with its file
    const index = await (await get('/')).text();
    for (const one of listStages(dirs))
      expect(index).toContain(
        `<mds-link href="/view/${one.key}">${one.key}</mds-link></mds-text></mds-table-cell><mds-table-cell><mds-text typography="detail"><mds-link href="vscode://file${encodeURI(one.file)}"`,
      );
    expect(index).toContain(link);
    // the page of a stage, under its title
    expect(await (await get('/view/drafts/decision/option-a')).text()).toContain(
      `<mds-text typography="detail" tag="p">${link}</mds-text>`,
    );
  });

  test('the page around the stages is a page of Magma: its components, its Tailwind classes', async () => {
    const page = await (await get('/view/drafts/decision/option-a?mode=dark')).text();
    // the page of render_preview, with no inset and the mode of the system
    expect(page).toContain(INIT_SCRIPT);
    expect(page).toContain('<script type="module" src="/components/magma-components.esm.js">');
    expect(page).toContain('#magma-preview { display: flow-root; padding: 0px; }');
    expect(page).not.toContain('data-magma-pref');
    // the view in mds-input-select, the classes of the chrome compiled
    expect(page).toContain('<mds-input-select name="mode" value="dark">');
    expect(page).toMatch(/\.grid-cols-\\\[16rem_1fr\\\] \{\s*grid-template-columns: 16rem 1fr;/);
    // the stage asked is the current item of the list, the others are links
    expect(page).toContain(
      '<li aria-current="page"><mds-text typography="action">option-a</mds-text></li>',
    );
    expect(page).toContain(
      '<mds-link href="/view/previews/message-placement/region-info?mode=dark">region-info</mds-link>',
    );
  });

  test('the frame shows the stage at the width asked and the height it declares, and what to try', async () => {
    const { tablet } = breakpointsOf(serveContext);
    const frame = await (
      await get('/view/previews/message-placement/region-info?width=tablet')
    ).text();
    expect(frame).toContain(
      `src="/stage/previews/message-placement/region-info?width=tablet" data-key="previews/message-placement/region-info" data-height="300" style="width: ${tablet}px; height: 300px"`,
    );
    expect(frame).toContain(
      '<mds-text typography="detail" tag="p">Look at the message in the region.</mds-text>',
    );
    // a view render_preview refuses is said, and the default is shown instead
    const wrong = await (
      await get('/view/previews/message-placement/region-info?width=100&theme=neon')
    ).text();
    expect(wrong).toContain('pixels from 320 to 2000: not 100.');
    expect(wrong).toContain('No theme neon');
    // a file with no header says what is wrong, and is still shown, as tall as its content
    const bare = path.join(dirs.drafts, 'decision/bare.html');
    writeFileSync(bare, '<mds-fixture>x</mds-fixture>\n');
    try {
      const page = await (await get('/view/drafts/decision/bare')).text();
      expect(page).toContain('it opens with a comment of keys');
      expect(page).toContain('data-height="auto"');
    } finally {
      rmSync(bare);
    }
  });

  test('a saved stage is told to the page; an added or removed one changes the list', async () => {
    // a server and folders of its own: the watch of the system may tell a change late, so
    // the writes of another test must not reach this one
    const own = stagesOf();
    const watched = await servePreviews({
      context: serveContext,
      dirs: own.dirs,
      port: 0,
      settle: 20,
    });
    const events = await eventsOf(watched.url);
    try {
      const file = path.join(own.dirs.previews, 'message-placement/region-info.html');
      writeFileSync(file, readFileSync(file, 'utf8').replace('aggiornate', 'salvate'));
      expect(
        await events.next((one) => one.key === 'previews/message-placement/region-info'),
      ).toEqual({ type: 'change', key: 'previews/message-placement/region-info' });
      const added = path.join(own.dirs.drafts, 'decision/added.html');
      writeFileSync(added, '<!--\ntry: x\n-->\n<mds-fixture>x</mds-fixture>\n');
      await events.next(
        (one) => one.type === 'list' && one.keys!.includes('drafts/decision/added'),
      );
      rmSync(added);
      expect(
        await events.next(
          (one) => one.type === 'list' && !one.keys!.includes('drafts/decision/added'),
        ),
      ).toEqual({ type: 'list', keys: listStages(own.dirs).map((one) => one.key) });
    } finally {
      await events.close();
      await watched.close();
      rmSync(own.root, { recursive: true, force: true });
    }
  });
});

/** A browser of the machine, in the order render_preview tries them. */
const launch = async (): Promise<Browser> => {
  for (const channel of ['chrome', 'msedge', undefined])
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      // the next one
    }
  throw new Error('No browser: install Google Chrome, or npx playwright install chromium.');
};

// the components of the build of this repository: the real hydration, the real styles
const BUILT = path.join(
  import.meta.dirname,
  '../../stencil/dist/magma-components/magma-components.esm.js',
);
/** The hydrated flag of Stencil, the attribute or the class (./render-page.ts). */
const HYDRATED = ':is([hydrated], .hydrated)';
describe.skipIf(!existsSync(BUILT) && !process.env.CI)('serve.previews on the built magma', () => {
  const built = () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-serve-built-'));
    return { root, settings: { root } };
  };

  test('a mode set in the page gives the image of the mode render_preview emulates', async () => {
    // a stage with no focused field: the caret of one blinks, so no two images of it match
    const markup = `<div style="display: grid; gap: calc(var(--spacing) * 300)">
  <mds-banner variant="error" headline="Salvataggio non riuscito">Il server non risponde: riprova.</mds-banner>
  <mds-text typography="h5">Modifica azienda</mds-text>
  <div style="display: flex; gap: calc(var(--spacing) * 200)">
    <mds-button tone="weak">Annulla</mds-button>
    <mds-button>Salva</mds-button>
  </div>
</div>`;
    const shot = async (mode: 'light' | 'dark', prefMode?: 'light' | 'dark') => {
      const [image] = await render(built(), {
        markup,
        widths: [480],
        mode,
        ...(prefMode ? { prefMode } : {}),
        lang: PREVIEW_LANG,
      });
      expect(image!.problems).toEqual([]);
      return readFileSync(image!.file);
    };
    // dark set on a light system, light set on a dark one
    expect((await shot('light', 'dark')).equals(await shot('dark'))).toBe(true);
    expect((await shot('dark', 'light')).equals(await shot('light'))).toBe(true);
  }, 90_000);

  test('the browser loads the stage again when its file is saved, not the page around it', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-serve-live-'));
    const dirs = { previews: path.join(root, 'previews'), drafts: path.join(root, 'drafts') };
    const file = path.join(dirs.drafts, 'live/save.html');
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      '<!--\ntry: Look at the label.\n-->\n<div id="row" class="flex gap-600"><mds-button>Salva</mds-button></div>\n',
    );
    const server = await servePreviews({ context: built(), dirs, port: 0, settle: 20 });
    const browser = await launch();
    try {
      const page = await browser.newPage();
      await page.goto(`${server.url}view/drafts/live/save`);
      const stage = page.frameLocator('#stage');
      await stage.locator(`mds-button${HYDRATED}`, { hasText: 'Salva' }).waitFor();
      // a Tailwind class of the draft applies in the stage
      expect(await stage.locator('#row').evaluate((row) => getComputedStyle(row).display)).toBe(
        'flex',
      );
      await page.evaluate(() => Object.assign(window, { untouched: true }));
      writeFileSync(file, readFileSync(file, 'utf8').replace('>Salva<', '>Salva e chiudi<'));
      await stage
        .locator(`mds-button${HYDRATED}`, { hasText: 'Salva e chiudi' })
        .waitFor({ timeout: 10_000 });
      expect(await page.evaluate(() => (window as { untouched?: boolean }).untouched)).toBe(true);
      // the frame is as tall as the content of the stage, as the viewport of render_preview
      const height = await page.evaluate(() => document.getElementById('stage')!.offsetHeight);
      expect(height).toBeGreaterThan(40);
    } finally {
      await browser.close();
      await server.close();
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);
});
