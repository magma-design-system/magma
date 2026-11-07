/*
  The pages to open to test what a branch changes, as a table: title, what changed, URL (#1319).
  Most of the work of this repository shows in a browser; the agent turns this table into the
  one the person tests with (Title, What to test, URL), writing what to test from the commits and
  the diff, and keeps the addresses as they are printed here.

    tsx --tsconfig projects/mcp/tsconfig.json scripts/test-urls.ts [--base=<ref>] [--head=<ref>]
        [--storybook=<url>] [--studio=<url>] [--previews=<url>]
                                    print the table in Markdown

  The tsconfig of projects/mcp maps the imports of the lint that serve-previews.ts makes, as
  check.agent-context does. Where each answer comes from:

  - what changed: `git diff --name-only <base>...<head>`, the changes of head since it left base;
    base: the default branch of origin (`refs/remotes/origin/HEAD`), head: HEAD;
  - what each change says: the subjects of the commits of head that touch it, merges left out
    (docs/COMMITS.md: a subject is written for whoever reads the release notes);
  - a component (`projects/stencil/src/components/<name>/`) and any stories file: the entries of
    the index of the running Storybook (`<storybook>/index.json`: the id of each docs page and
    story and the file it comes from, relative to projects/stencil), the docs page first. An id
    comes from the title of the stories, not from the name of the component (`mds-chip` is
    `ui-chip--docs`), so no address is written without the index. Storybook's address: the port
    the `start` script of projects/stencil/package.json pins (`storybook dev -p <port>`);
  - the studio (`projects/studio/`): its pages and their addresses from
    projects/studio/src/routes.ts (`COLORS_PAGES`, `BEHAVIOR_PAGES`, `hrefOf`), at the port of
    `server.port` in projects/studio/vite.config.ts;
  - design tokens and styles (`projects/design-tokens/`, `projects/styles/`): no page of their
    own; the Colors pages of the studio are the views of the tokens (routes.ts), the components
    show the styles in Storybook;
  - a preview of a case (`<SOURCES.previews>/<folder>/<name>.html`): `/view/previews/<folder>/<name>`
    of serve.previews (`SOURCES`, `PORT` and the routes of projects/mcp/scripts/serve-previews.ts);
  - anything else: no page in the browser; it is listed anyway, so no change goes unseen.
*/
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORT as PREVIEWS_PORT, SOURCES } from '../projects/mcp/scripts/serve-previews.ts';
import { BEHAVIOR_PAGES, COLORS_PAGES, hrefOf, type Route } from '../projects/studio/src/routes.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The port Storybook's `start` script pins, from the text of projects/stencil/package.json. */
export const storybookPort = (packageJson: string): number | null => {
  const scripts = (JSON.parse(packageJson) as { scripts?: Record<string, string> }).scripts ?? {};
  const match = /storybook dev\b.*?-p\s+(\d+)/.exec(scripts.start ?? '');
  return match ? Number(match[1]) : null;
};

/** The port of the dev server of the studio, from the text of its vite.config.ts. */
export const studioPort = (viteConfig: string): number | null => {
  const match = /server:\s*\{[^}]*?\bport:\s*(\d+)/s.exec(viteConfig);
  return match ? Number(match[1]) : null;
};

export type Area =
  | { kind: 'component'; name: string }
  | { kind: 'stories'; file: string }
  | { kind: 'studio' }
  | { kind: 'tokens' }
  | { kind: 'styles' }
  | { kind: 'preview'; folder: string; name: string }
  | { kind: 'other' };

const STENCIL = 'projects/stencil/';

/** The area a changed file belongs to. */
export const areaOf = (file: string): Area => {
  const component = /^projects\/stencil\/src\/components\/([^/]+)\//.exec(file);
  if (component) return { kind: 'component', name: component[1] };
  if (file.startsWith(STENCIL) && /\.stories\.(t|j)sx?$/.test(file))
    return { kind: 'stories', file: file.slice(STENCIL.length) };
  if (file.startsWith('projects/studio/')) return { kind: 'studio' };
  if (file.startsWith('projects/design-tokens/')) return { kind: 'tokens' };
  if (file.startsWith('projects/styles/')) return { kind: 'styles' };
  const preview = new RegExp(`^${SOURCES.previews}/([^/]+)/([^/]+)\\.html$`).exec(file);
  if (preview) return { kind: 'preview', folder: preview[1], name: preview[2] };
  return { kind: 'other' };
};

const keyOf = (area: Area): string =>
  area.kind === 'component'
    ? `component:${area.name}`
    : area.kind === 'stories'
      ? `stories:${area.file}`
      : area.kind === 'preview'
        ? `preview:${area.folder}/${area.name}`
        : area.kind;

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  importPath: string;
  type: 'docs' | 'story';
}

export interface Servers {
  storybook: string;
  studio: string;
  previews: string;
  /** The entries of Storybook's index, or null when Storybook does not answer. */
  index: StoryEntry[] | null;
}

export interface Row {
  title: string;
  changes: string[];
  links: { label: string; url: string }[];
  /** Said when there is no link: why, and what to do. */
  note?: string;
  files: string[];
}

const storyUrl = (base: string, entry: StoryEntry) =>
  `${base}/?path=/${entry.type === 'docs' ? 'docs' : 'story'}/${entry.id}`;

const studioPages = (base: string, only?: 'colors'): { label: string; url: string }[] => {
  const routes: { label: string; route: Route }[] = [
    ...COLORS_PAGES.map((page) => ({
      label: `Colors / ${page.label}`,
      route: { section: 'colors', view: page.id } as Route,
    })),
    ...(only ? [] : [{ label: 'Theme', route: { section: 'theme' } as Route }]),
    ...(only
      ? []
      : BEHAVIOR_PAGES.map((page) => ({
          label: `Behavior / ${page.label}`,
          route: { section: 'behavior', page: page.id } as Route,
        }))),
  ];
  return routes.map(({ label, route }) => ({ label, url: `${base}/${hrefOf(route)}` }));
};

/** The rows of the table: one per area, in a fixed order (components, stories, studio, tokens, styles, previews, other). */
export const rowsOf = (
  files: string[],
  subjectsOf: (files: string[]) => string[],
  servers: Servers,
): Row[] => {
  const groups = new Map<string, { area: Area; files: string[] }>();
  for (const file of files) {
    const area = areaOf(file);
    const key = keyOf(area);
    groups.set(key, { area, files: [...(groups.get(key)?.files ?? []), file] });
  }
  const order = ['component', 'stories', 'studio', 'tokens', 'styles', 'preview', 'other'];
  const sorted = [...groups.entries()].sort(
    ([a, ga], [b, gb]) =>
      order.indexOf(ga.area.kind) - order.indexOf(gb.area.kind) || a.localeCompare(b),
  );
  const noStorybook = `Storybook does not answer at ${servers.storybook}: start it, then run again`;
  return sorted.map(([, { area, files: group }]) => {
    const changes = subjectsOf(group);
    const stories = (match: (entry: StoryEntry) => boolean) => {
      if (!servers.index) return { links: [], note: noStorybook };
      const entries = servers.index
        .filter(match)
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'docs' ? -1 : 1));
      return entries.length
        ? {
            links: entries.map((entry) => ({
              label: entry.type === 'docs' ? `${entry.title}: Docs` : entry.name,
              url: storyUrl(servers.storybook, entry),
            })),
          }
        : { links: [], note: 'no story in Storybook shows it' };
    };
    const strip = (importPath: string) => importPath.replace(/^\.\//, '');
    switch (area.kind) {
      case 'component':
        return {
          title: area.name,
          changes,
          files: group,
          ...stories((entry) => strip(entry.importPath).startsWith(`src/components/${area.name}/`)),
        };
      case 'stories':
        return {
          title: area.file,
          changes,
          files: group,
          ...stories((entry) => strip(entry.importPath) === area.file),
        };
      case 'studio':
        return { title: 'studio', changes, files: group, links: studioPages(servers.studio) };
      case 'tokens':
        return {
          title: 'design tokens',
          changes,
          files: group,
          links: studioPages(servers.studio, 'colors'),
          note: 'and the components that use them, in Storybook',
        };
      case 'styles':
        return {
          title: 'styles',
          changes,
          files: group,
          links: [{ label: 'Storybook', url: `${servers.storybook}/` }],
          note: 'the components show them',
        };
      case 'preview':
        return {
          title: `preview ${area.folder}/${area.name}`,
          changes,
          files: group,
          links: [
            {
              label: `${area.folder}/${area.name}`,
              url: `${servers.previews}/view/previews/${area.folder}/${area.name}`,
            },
          ],
        };
      default:
        return {
          title: 'no page in the browser',
          changes,
          files: group,
          links: [],
          note: `${group.length} file${group.length === 1 ? '' : 's'}: tests, docs, tooling or CI`,
        };
    }
  });
};

/**
 * The subjects worth reading, each once: a `chore(release)` commit only writes versions, pins and
 * changelogs (docs/WORKFLOW.md, "Releases"), there is nothing in it to test.
 */
export const meaningful = (subjects: string[]): string[] => [
  ...new Set(subjects.filter((subject) => subject && !subject.startsWith('chore(release)'))),
];

const cell = (text: string): string => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');

const capped = (items: string[], max: number): string[] =>
  items.length > max ? [...items.slice(0, max), `+${items.length - max} more`] : items;

/** The table in Markdown: at most `max` commits and `max` links a row, the rest counted. */
export const render = (rows: Row[], header: string, max = 6): string => {
  const lines = [header, '', '| Title | What changed | URL |', '|-------|--------------|-----|'];
  for (const row of rows) {
    const links = capped(
      row.links.map((one) => `[${cell(one.label)}](${one.url})`),
      max,
    );
    if (row.note) links.push(cell(row.note));
    lines.push(
      `| ${cell(row.title)} | ${capped(row.changes.map(cell), max).join('<br>') || '-'} | ${links.join('<br>') || '-'} |`,
    );
  }
  if (!rows.length) lines.push('| - | nothing changed | - |');
  return lines.join('\n');
};

const git = (args: string[]): string =>
  execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd();

const answers = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, { signal: AbortSignal.timeout(3000) });
    return true;
  } catch {
    return false;
  }
};

const readIndex = async (base: string): Promise<StoryEntry[] | null> => {
  try {
    const response = await fetch(`${base}/index.json`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = (await response.json()) as { entries?: Record<string, StoryEntry> };
    return data.entries ? Object.values(data.entries) : null;
  } catch {
    return null;
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const value = (name: string) =>
    args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  let base = value('base');
  if (!base) {
    try {
      base = git(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
    } catch {
      console.error(
        'the default branch of origin is unknown (no refs/remotes/origin/HEAD): pass --base=<ref>',
      );
      process.exitCode = 2;
      return;
    }
  }
  const head = value('head') ?? 'HEAD';
  const sbPort = storybookPort(
    readFileSync(path.join(ROOT, 'projects/stencil/package.json'), 'utf8'),
  );
  const stPort = studioPort(
    readFileSync(path.join(ROOT, 'projects/studio/vite.config.ts'), 'utf8'),
  );
  const storybook = (value('storybook') ?? (sbPort ? `http://localhost:${sbPort}` : '')).replace(
    /\/$/,
    '',
  );
  const studio = (value('studio') ?? (stPort ? `http://localhost:${stPort}` : '')).replace(
    /\/$/,
    '',
  );
  const previews = (value('previews') ?? `http://localhost:${PREVIEWS_PORT}`).replace(/\/$/, '');
  const files = git(['diff', '--name-only', `${base}...${head}`])
    .split('\n')
    .filter(Boolean);
  const subjectsOf = (group: string[]) =>
    meaningful(
      git(['log', '--no-merges', '--format=%s', `${base}..${head}`, '--', ...group]).split('\n'),
    );
  const index = storybook ? await readIndex(storybook) : null;
  const rows = rowsOf(files, subjectsOf, { storybook, studio, previews, index });
  const kinds = new Set(files.map((file) => areaOf(file).kind));
  const state = async (name: string, url: string, needed: boolean, start: string) =>
    needed
      ? `${name} ${(await answers(url)) ? 'answers' : `does not answer (${start})`} at ${url}`
      : null;
  const servers = (
    await Promise.all([
      state(
        'Storybook',
        storybook,
        kinds.has('component') ||
          kinds.has('stories') ||
          kinds.has('styles') ||
          kinds.has('tokens'),
        'npx nx run stencil:storybook.start',
      ),
      state(
        'the studio',
        studio,
        kinds.has('studio') || kinds.has('tokens'),
        'npx nx run studio:serve',
      ),
      state('serve.previews', previews, kinds.has('preview'), 'npx nx run mcp:serve.previews'),
    ])
  ).filter(Boolean);
  const header = [
    `## What to test: \`${head}\` since it left \`${base}\``,
    '',
    `${files.length} file${files.length === 1 ? '' : 's'} changed.${servers.length ? ` ${servers.join('; ')}.` : ''}`,
  ].join('\n');
  console.info(render(rows, header));
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))
  void main();
