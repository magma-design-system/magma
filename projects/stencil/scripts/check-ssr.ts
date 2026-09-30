/**
 * Guard against SSR regressions in the hydrate build (`magma/hydrate`).
 *
 * Every component must serialize through `renderToString` without error
 * diagnostics: failures there are silent by design (component lifecycles run
 * inside `safeCall`, exceptions become diagnostics and the partial HTML ships
 * anyway), so without this guard a broken component quietly renders wrong or
 * empty markup in every SSR consumer. This script makes those failures loud.
 *
 * For each tag found in dist/documentation.json it renders a minimal markup
 * (plus representative props/context where the component requires them) and
 * asserts:
 *
 * 1. no `error`-level diagnostics were emitted;
 * 2. the output contains a declarative shadow DOM template
 *    (`shadowrootmode="open"`);
 * 3. the host carries the `hydrated` flag (otherwise the anti-FOUC
 *    `hydrated.css` would keep the server-rendered markup invisible).
 *
 * Run from the stencil package dir, after `npm run build`:
 *   npm run check.ssr
 */
import fs from 'fs';
import path from 'path';
import { DIST_DIR } from './meta';

/**
 * Extra attributes / light-DOM context for components whose defaults cannot
 * render meaningfully. Keep entries minimal and justified: everything not
 * listed here renders as a bare `<tag></tag>`.
 */
const TAG_MARKUP: Record<string, string> = {
  // `filename` is a required prop, validated in componentWillLoad
  'mds-file': '<mds-file filename="document.pdf"></mds-file>',
  'mds-file-preview': '<mds-file-preview filename="document.pdf"></mds-file-preview>',
  // `src` is a required prop, parsed with `new URL()`
  'mds-url-view': '<mds-url-view src="https://example.com/"></mds-url-view>',
  // floating components search their caller in the document
  'mds-tooltip':
    '<button id="ssr-caller">caller</button><mds-tooltip target="#ssr-caller">tip</mds-tooltip>',
  'mds-dropdown':
    '<button id="ssr-caller">caller</button><mds-dropdown target="#ssr-caller">content</mds-dropdown>',
};

/**
 * Tags allowed to emit error diagnostics, with the reason. Must stay empty
 * unless a component legitimately cannot run server-side; never park real
 * regressions here.
 */
const ALLOWED_DIAGNOSTICS: Record<string, string> = {};

type Diagnostic = { level: string; messageText: string };
type HydrateResults = { html: string; diagnostics: Diagnostic[] };
type HydrateModule = {
  renderToString: (html: string, options: Record<string, unknown>) => Promise<HydrateResults>;
};

const failures: string[] = [];

const main = async (): Promise<void> => {
  const documentationPath = path.join(DIST_DIR, 'documentation.json');
  const hydratePath = path.join(DIST_DIR, 'hydrate', 'index.mjs');
  for (const [file, hint] of [
    [documentationPath, 'npm run build'],
    [hydratePath, 'npm run build (dist-hydrate-script output target)'],
  ]) {
    if (!fs.existsSync(file)) {
      console.error(`missing ${file} - run \`${hint}\` first`);
      process.exitCode = 1;
      return;
    }
  }

  const documentation = JSON.parse(fs.readFileSync(documentationPath, 'utf8')) as {
    components: Array<{ tag: string }>;
  };
  const tags = documentation.components.map((component) => component.tag);
  const { renderToString } = (await import(hydratePath)) as HydrateModule;

  console.info(`Checking SSR (renderToString) across ${tags.length} components\n`);

  // components log expected noise (icon fetch failures, target warnings);
  // only the diagnostics matter here
  const mutedConsole = { error: console.error, warn: console.warn };
  console.error = () => undefined;
  console.warn = () => undefined;

  for (const tag of tags) {
    const markup = TAG_MARKUP[tag] ?? `<${tag}></${tag}>`;
    try {
      const results = await renderToString(markup, {
        fullDocument: false,
        prettyHtml: false,
        serializeShadowRoot: 'declarative-shadow-dom',
      });
      const errors = (results.diagnostics ?? []).filter(
        (diagnostic) => diagnostic.level === 'error',
      );
      if (errors.length > 0 && !(tag in ALLOWED_DIAGNOSTICS)) {
        const first = String(errors[0].messageText).split('\n')[0];
        failures.push(`${tag}: ${errors.length} error diagnostic(s) - ${first}`);
        continue;
      }
      if (!results.html.includes('shadowrootmode')) {
        failures.push(`${tag}: no declarative shadow DOM template in output`);
        continue;
      }
      if (!results.html.includes('hydrated')) {
        failures.push(`${tag}: missing hydrated flag - hydrated.css would hide the SSR markup`);
      }
    } catch (error) {
      failures.push(`${tag}: renderToString threw - ${(error as Error).message.split('\n')[0]}`);
    }
  }

  console.error = mutedConsole.error;
  console.warn = mutedConsole.warn;

  if (failures.length > 0) {
    console.error(`\n${failures.length} SSR check(s) failed:`);
    for (const failure of failures) {
      console.error(`  ✖ ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.info(`✔ SSR checks passed (${tags.length} components)`);
};

void main();
