// The twelve tools of the MCP server on fixtures cut from the real data, and the mi and mdi icon
// sets installed in this repository.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { readPreviews } from '../src/core/patterns.js';
import { checkSetup, mcpEntries, pluginEnabled, satisfies } from '../src/mcp/checks.js';
import { distance, parseColor } from '../src/mcp/color.js';
import { GAP } from '../src/mcp/context.js';
import {
  breakpointsOf,
  DEFAULT_WIDTH,
  LAYERS,
  MAX_SIDE,
  PREVIEW_DIR,
  render,
  renderPreview,
  STYLESHEETS,
  themesOf,
} from '../src/mcp/render.js';
import { createServer, INSTRUCTIONS, toolsList, toolsOf } from '../src/mcp/server.js';
import { tokensOf, USE_OF_UTILITY } from '../src/mcp/tokens.js';
import { context, data, fixtures } from './mcp-context.js';

/** Every slug the iconsauce plugins serve, dumped by the stencil build (projects/stencil/SPEC.md, Icons). */
const ICONS_DICTIONARY = path.join(
  import.meta.dirname,
  '../../stencil/src/fixtures/icons-dictionary.json',
);

const tools = Object.fromEntries(toolsOf(context).map((tool) => [tool.name, tool]));
// the tests read the structured content of each tool freely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = Record<string, any>;
const run = async (name: string, args: Record<string, unknown> = {}): Promise<Result> =>
  tools[name]!.run(args);

test('the server has its twelve tools', () => {
  expect(Object.keys(tools).sort()).toEqual([
    'check_markup',
    'check_setup',
    'explain_class',
    'find_component',
    'find_icon',
    'get_component',
    'get_guide',
    'get_pattern',
    'get_usage',
    'list_tokens',
    'render_preview',
    'suggest_role',
  ]);
});

test('the tools as data are the answer of tools/list, whatever the project', async () => {
  const { handle } = createServer(context);
  expect(await handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' })).toEqual({
    jsonrpc: '2.0',
    id: 1,
    result: toolsList(context),
  });
  // what the stencil build writes into dist/lint/mcp/tools.json, from no project at all
  expect(toolsList({ root: tmpdir(), settings: {} })).toEqual(toolsList(context));
});

describe('a question Magma has nothing for', () => {
  test('a search that matches nothing says it is a gap to report', async () => {
    const nothing = 'zzqxv';
    expect(await run('find_component', { query: nothing })).toEqual({ components: [], gap: GAP });
    expect(await run('list_tokens', { query: nothing })).toMatchObject({ tokens: [], gap: GAP });
    expect(await run('find_icon', { query: nothing })).toMatchObject({ icons: [], gap: GAP });
    // an answer is no gap
    expect(await run('find_component', { query: 'a date range picker' })).not.toHaveProperty('gap');
    expect(await run('find_icon', { query: 'delete' })).not.toHaveProperty('gap');
  });

  test('the instructions and the answers point at a section the reporting guide has', () => {
    const section = 'A tool or an answer the MCP server is missing';
    expect(INSTRUCTIONS).toContain(`get_guide reporting`);
    expect(INSTRUCTIONS).toContain(section);
    expect(GAP).toContain(section);
    const guide = readFileSync(
      path.join(import.meta.dirname, '../../../docs/agents/reporting.md'),
      'utf8',
    );
    expect(guide).toMatch(new RegExp(`^## \\d+\\. ${section}$`, 'm'));
  });
});

describe('the component tools', () => {
  test('find_component ranks the component a need describes first', async () => {
    const { components } = await run('find_component', { query: 'a date range picker' });
    expect(components[0].tag).toBe('mds-input-date-range');
    expect(components[0].summary).toMatch(/\.$/);
  });

  test('get_component gives the values, events and docs of a component, by tag or wrapper name', async () => {
    const button = await run('get_component', { tag: 'MdsButton' });
    expect(button.tag).toBe('mds-button');
    expect(button.props.find((prop: { name: string }) => prop.name === 'variant')).toMatchObject({
      attribute: 'variant',
      values: expect.arrayContaining(['primary', 'error']),
      default: "'primary'",
    });
    expect(button.slots.map((slot: { name: string }) => slot.name)).toContain('default');
    expect(button.cssProperties.map((style: { name: string }) => style.name)).toEqual([
      '--mds-button-background',
      '--mds-button-color',
      '--mds-button-gap',
      '--mds-button-label-transform',
      '--mds-button-radius',
    ]);
    expect(button.internalCssProperties).toBe(11);
    const book = await run('get_component', { tag: 'mds-book' });
    expect(book.cssProperties).toContainEqual(
      expect.objectContaining({ name: '--mds-book-spine-color', static: true }),
    );
    const input = await run('get_component', { tag: 'mds-input' });
    expect(input.events.map((event: { name: string }) => event.name)).toContain('mdsInputChange');
    await expect(run('get_component', { tag: 'mds-buton' })).rejects.toThrow(
      /No component mds-buton/,
    );
  });

  test('get_component lists the shipped docs of the component: its API, examples and mistakes', async () => {
    // a magma package with the shipped docs of mds-button beside its documentation.json
    const root = mkdtempSync(path.join(tmpdir(), 'magma-docs-'));
    const documentation = path.join(root, 'data/documentation.json');
    mkdirSync(path.dirname(documentation), { recursive: true });
    writeFileSync(documentation, readFileSync(data.documentation));
    const dir = path.join(root, 'dist/collection/components/mds-button');
    mkdirSync(dir, { recursive: true });
    for (const name of ['AGENTS.md', 'examples.md', 'mistakes.md'])
      writeFileSync(path.join(dir, name), '');
    const settings = { ...context.settings, documentation };
    const getComponent = toolsOf({ ...context, settings }).find(
      (tool) => tool.name === 'get_component',
    )!;
    const { files } = (await getComponent.run({ tag: 'mds-button' })) as Result;
    expect(files).toEqual({
      api: path.join(dir, 'AGENTS.md'),
      examples: path.join(dir, 'examples.md'),
      mistakes: path.join(dir, 'mistakes.md'),
    });
  });

  test('get_usage writes props and events as each framework does', async () => {
    const react = await run('get_usage', { tag: 'mds-input', framework: 'react' });
    expect(react.import).toBe("import { MdsInput } from '@maggioli-design-system/magma-react';");
    expect(
      react.events.find((event: { name: string }) => event.name === 'mdsInputChange').written,
    ).toMatch(/^onMdsInputChange=/);
    const angular = await run('get_usage', { tag: 'mds-button', framework: 'angular' });
    expect(angular.props.find((prop: { name: string }) => prop.name === 'disabled').written).toBe(
      '[disabled]="isOn"',
    );
    const html = await run('get_usage', { tag: 'mds-button', framework: 'html' });
    expect(html.import).toMatch(/defineCustomElementMdsButton/);
    expect(html.example).toMatch(/^<mds-button label="value"/);
    expect(html.example).not.toMatch(/addEventListener/);
  });
});

describe('the token tools', () => {
  test('list_tokens finds a role by what it is for, with its class and value', async () => {
    const { tokens } = await run('list_tokens', { query: 'secondary text' });
    expect(tokens[0]).toMatchObject({
      css: '--magma-text-muted',
      tier: 'semantic',
      classes: ['text-fg-muted'],
    });
    expect(tokens[0].value).toMatch(/^#[0-9a-f]{6}$/);
    // the words of the need weigh more than a word of the name
    expect((await run('list_tokens', { query: 'card background' })).tokens[0].css).toBe(
      '--magma-surface-raised',
    );
    const radius = await run('list_tokens', { query: 'radius', tier: 'all' });
    expect(
      radius.tokens.some((token: { classes: string[] }) => token.classes.includes('rounded-md')),
    ).toBe(true);
  });

  test('suggest_role finds the role of a raw step, a literal or a class, by use', async () => {
    const muted = await run('suggest_role', { color: 'text-tone-neutral-03' });
    expect(muted.use).toBe('text');
    expect(muted.roles[0]).toMatchObject({ css: '--magma-text-muted', distance: 0 });
    const page = await run('suggest_role', { color: '#ffffff', use: 'background' });
    expect(page.roles[0].class).toMatch(/^bg-/);
    await expect(run('suggest_role', { color: 'not a colour' })).rejects.toThrow(
      /Cannot read a colour/,
    );
  });

  test('explain_class says what a class reads, and the traps', async () => {
    const trap = await run('explain_class', { class: 'p-4' });
    expect(trap).toMatchObject({
      kind: 'spacing-step',
      suggestion: expect.stringMatching(/write p-400/),
    });
    expect(await run('explain_class', { class: 'p-400' })).not.toHaveProperty('suggestion');
    expect(await run('explain_class', { class: 'hover:bg-surface-raised/50' })).toMatchObject({
      kind: 'token',
      tokens: [{ css: '--magma-surface-raised' }],
    });
    expect(await run('explain_class', { class: 'bg-tone-neutral-03' })).toMatchObject({
      kind: 'raw-palette',
    });
    expect(await run('explain_class', { class: 'bg-white' })).toMatchObject({
      kind: 'tailwind-palette',
    });
    expect(await run('explain_class', { class: 'text-title-h3' })).toMatchObject({
      kind: 'magma-utility',
    });
    expect(await run('explain_class', { class: 'w-[13px]' })).toMatchObject({ kind: 'arbitrary' });
    expect(await run('explain_class', { class: 'flex' })).toMatchObject({ kind: 'other' });
  });

  test('every value reads as CSS, by its DTCG type', async () => {
    const byCss = Object.fromEntries(
      tokensOf(context)
        .filter((entry) => entry.css)
        .map((entry) => [entry.css, entry.value]),
    );
    // shadows: one layer per item, inset first, a colour with its alpha
    expect(byCss['--shadow-xs']).toBe('0px 1px 2px 0px rgb(0 0 0 / 0.05)');
    expect(byCss['--shadow-highlight-strong']).toBe(
      '0px 0px 0px 2px rgb(0 0 0 / 0.4), 0px 4px 6px -1px rgb(0 0 0 / 0.65)',
    );
    expect(byCss['--shadow-inset-sm']).toMatch(
      /^inset 0px 2px 4px 0px rgb\(0 0 0 \/ 0\.05\), inset /,
    );
    // an alias of a shadow, a border whose colour is an alias
    expect(byCss['--shadow-sharp']).toBe(byCss['--shadow-sm-sharp']);
    expect(byCss['--magma-outline-blur']).toBe('2px solid rgb(0 0 0 / 0)');
    // where the CSS writes it differently, the cssValue the package records
    expect(byCss['--mds-elevation-raised']).toMatch(/^0 calc\(1px \* var\(--depth\)\)/);
    expect(byCss['--aspect-book']).toBe('1/1.4');
    expect(byCss['--text-size-title-h1--letter-spacing']).toBe('-0.025em');
    expect(byCss['--ease-in-back']).toMatch(/^cubic-bezier\(/);
    expect(byCss['--font-code']).toBe("'Roboto Mono', 'Courier New', monospace");

    const { tokens } = await run('list_tokens', { query: 'shadow', tier: 'all' });
    expect(tokens.some((token: { value?: string }) => token.value?.includes('[object'))).toBe(
      false,
    );
    expect(await run('explain_class', { class: 'shadow-highlight-strong' })).toMatchObject({
      tokens: [{ css: '--shadow-highlight-strong', value: byCss['--shadow-highlight-strong'] }],
    });
  });

  /** No value is garbage, and only the types CSS has no single value for have none. */
  const expectCssValues = (entries: ReturnType<typeof tokensOf>) => {
    const bad = entries.filter(
      (entry) =>
        (entry.value === undefined && !['typography', 'gradient'].includes(entry.type)) ||
        /\[object|undefined|NaN/.test(entry.value ?? ''),
    );
    expect(bad.map((entry) => `${entry.path} (${entry.type}): ${entry.value}`)).toEqual([]);
  };

  test('the fixtures hold a token of every shape the published data has', () => {
    expectCssValues(tokensOf(context));
  });

  // the build of design-tokens and styles, when there is one: a shape the fixtures miss fails here
  const built = {
    tokens: path.join(import.meta.dirname, '../../design-tokens/dist/dtcg/base.tokens.json'),
    globals: path.join(import.meta.dirname, '../../styles/dist/dtcg/globals.tokens.json'),
    consumption: path.join(import.meta.dirname, '../../styles/dist/tailwind/consumption.json'),
  };
  test.skipIf(!Object.values(built).every((file) => existsSync(file)))(
    'every token of the built data reads as CSS',
    () => {
      expectCssValues(tokensOf({ ...context, settings: { ...context.settings, ...built } }));
      const roots = JSON.parse(readFileSync(built.consumption, 'utf8')).namespaces['--color']
        .utilities as string[];
      expect(roots.filter((root) => !USE_OF_UTILITY[root] && !root.startsWith('mask-'))).toEqual(
        [],
      );
    },
  );

  test('suggest_role keeps the utility and the opacity of a class, a shadow too', async () => {
    // a coloured glow takes a fill role, as a shadow class
    const glow = await run('suggest_role', { color: 'shadow-variant-primary-03/80' });
    expect(glow.use).toBe('shadow');
    expect(glow.roles[0]).toMatchObject({
      css: '--magma-accent-emphasis-hover',
      class: 'shadow-accent-emphasis-hover/80',
      distance: 0,
    });
    expect(
      (await run('suggest_role', { color: 'hover:border-tone-neutral-03/50' })).roles[0].class,
    ).toMatch(/^border-.+\/50$/);
    // the role made for a projected shadow is a candidate of the shadow use only
    const ink = await run('suggest_role', { color: '--magma-shadow-ink', use: 'shadow' });
    expect(ink.roles[0]).toMatchObject({ css: '--magma-shadow-ink', class: 'shadow-shadow-ink' });
    expect(
      (await run('suggest_role', { color: '--magma-shadow-ink' })).roles.map(
        (role: { css: string }) => role.css,
      ),
    ).not.toContain('--magma-shadow-ink');
    await expect(run('suggest_role', { color: 'mask-t-from-gray-100' })).rejects.toThrow(
      /only the alpha/,
    );
  });

  test('every colour utility says what it paints', () => {
    const roots = JSON.parse(readFileSync(data.consumption, 'utf8')).namespaces['--color']
      .utilities as string[];
    expect(roots.filter((root) => !USE_OF_UTILITY[root] && !root.startsWith('mask-'))).toEqual([]);
  });

  test('the colour arithmetic reads CSS colours', () => {
    expect(parseColor('#fff')).toEqual([1, 1, 1]);
    expect(parseColor('rgb(0 0 0 / 0.5)')).toEqual([0, 0, 0]);
    expect(parseColor('5 5 5')).toEqual([5 / 255, 5 / 255, 5 / 255]);
    expect(distance(parseColor('oklch(1 0 0)')!, [1, 1, 1])).toBeLessThan(0.001);
    expect(parseColor('nope')).toBeUndefined();
  });
});

describe('the icon tool', () => {
  test('finds slugs by meaning in the installed sets', async () => {
    const { icons, sets } = await run('find_icon', { query: 'delete' });
    expect(sets.find((set: { set: string }) => set.set === 'mi').installed).toBe(true);
    expect(icons.map((icon: { slug: string }) => icon.slug)).toContain('mi/baseline/delete');
    const mgg = await run('find_icon', { query: 'ricerca', set: 'mgg' });
    expect(mgg.icons).toEqual([
      { slug: 'mgg/ricerca-avanzata', set: 'mgg', name: 'ricerca-avanzata' },
    ]);
  });

  test('checks a slug and names the near ones when it does not exist', async () => {
    expect(await run('find_icon', { slug: 'mi/baseline/send' })).toMatchObject({ exists: true });
    const missing = await run('find_icon', { slug: 'mi/baseline/sendd' });
    expect(missing.exists).toBe(false);
    expect(missing.icons.map((icon: { name: string }) => icon.name)).toContain('send');
  });

  test('spells a multi-word Material slug with hyphens, as iconsauce serves it', async () => {
    // the file is auto_awesome/outline.svg, the slug mi/outline/auto-awesome
    expect(await run('find_icon', { slug: 'mi/outline/auto-awesome' })).toMatchObject({
      exists: true,
    });
    const folderSpelling = await run('find_icon', { slug: 'mi/outline/auto_awesome' });
    expect(folderSpelling.exists).toBe(false);
    expect(folderSpelling.icons[0]).toEqual({
      slug: 'mi/outline/auto-awesome',
      set: 'mi',
      name: 'auto-awesome',
    });
    const { icons } = await run('find_icon', {
      query: 'rocket launch',
      set: 'mi',
      variant: 'outline',
    });
    expect(icons.map((icon: { slug: string }) => icon.slug)).toContain('mi/outline/rocket-launch');
    expect(icons.every((icon: { slug: string }) => !icon.slug.includes('_'))).toBe(true);
  });

  test('agrees with the slugs iconsauce serves, both ways', async () => {
    const dictionary = new Set(JSON.parse(readFileSync(ICONS_DICTIONARY, 'utf8')) as string[]);
    const missing: string[] = [];
    for (const slug of dictionary)
      if (/^(mi|mdi)\//.test(slug) && !(await run('find_icon', { slug })).exists)
        missing.push(slug);
    expect(missing).toEqual([]);
    for (const variant of ['baseline', 'outline', 'round', 'sharp']) {
      const { icons } = await run('find_icon', { query: 'circle', variant, limit: 10_000 });
      expect(icons.length).toBeGreaterThan(50);
      expect(
        icons
          .map((icon: { slug: string }) => icon.slug)
          .filter((slug: string) => !dictionary.has(slug)),
      ).toEqual([]);
    }
  });

  test('names only the Material variants iconsauce serves', async () => {
    // @material-icons/svg has twotone.svg, iconsauce never writes it
    expect(await run('find_icon', { slug: 'mi/twotone/send' })).toMatchObject({ exists: false });
    await expect(run('find_icon', { query: 'send', variant: 'twotone' })).rejects.toThrow(
      /baseline, outline, round, sharp/,
    );
  });
});

describe('the guide tool', () => {
  test('lists the guides, the headings of one, the text of one section', async () => {
    const { guides } = await run('get_guide');
    expect(guides.map((guide: { name: string }) => guide.name)).toEqual([
      'AGENTS',
      'color',
      'lint',
    ]);
    const lint = await run('get_guide', { guide: 'lint.md' });
    expect(lint.sections.map((section: { heading: string }) => section.heading)).toContain(
      'Run it after writing',
    );
    const section = await run('get_guide', { guide: 'lint', section: 'set it up' });
    expect(section.text).toMatch(/^## Set it up\n/);
    expect(section.text).toMatch(/### React/);
    expect(section.text).not.toMatch(/Run it after writing/);
    await expect(run('get_guide', { guide: 'nope' })).rejects.toThrow(
      /the guides are AGENTS, color, lint/,
    );
  });
});

describe('the pattern tool', () => {
  test('without arguments the list, as get_guide lists the guides', async () => {
    const { patterns } = await run('get_pattern');
    // by group, in the order of the docs site, then by id
    expect(patterns.map((one: { id: string }) => one.id)).toEqual([
      'consent-and-legal',
      'confirm-action',
      'message-placement',
    ]);
    expect(patterns[2]).toMatchObject({
      title: 'Where a message goes',
      group: 'messages-and-states',
      status: 'decided',
      validatedOn: [],
    });
  });

  test('a need finds the patterns that answer it; none is a gap', async () => {
    const { patterns, gap } = await run('get_pattern', {
      need: 'tell the user a save failed, try again',
    });
    expect(patterns[0].id).toBe('message-placement');
    expect(gap).toBeUndefined();
    expect(await run('get_pattern', { need: 'zzqxv' })).toEqual({ patterns: [], gap: GAP });
  });

  test('a pattern comes with the layer of the project applied, its rules untouched', async () => {
    const { pattern } = await run('get_pattern', { id: 'message-placement' });
    expect(pattern.layers).toEqual(['magma', 'example-backoffice']);
    expect(pattern['open-choices'][0]).toMatchObject({
      id: 'success-toast-duration',
      default: '5000 ms',
      value: 8000,
      'narrowed-by': 'example-backoffice',
    });
    expect(pattern['always-true'].map((rule: { id: string }) => rule.id)).toContain(
      'toast-action-stays',
    );
    expect(pattern.situations.at(-1)).toMatchObject({
      case: 'action-done-elsewhere',
      layer: 'example-backoffice',
    });
    expect(pattern.sections).toContain('Behaviour over time');
  });

  test('a layer that narrows an "Always true" rule is not applied, and says why', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-layer-'));
    mkdirSync(path.join(root, 'magma/patterns'), { recursive: true });
    writeFileSync(
      path.join(root, 'magma/patterns/message-placement.md'),
      '---\nid: message-placement\nextends: magma:message-placement\nlayer: rogue\nnarrows:\n  toast-action-stays: false\n---\n',
    );
    const tool = toolsOf({ ...context, root }).find((one) => one.name === 'get_pattern')!;
    const result = (await tool.run({ id: 'message-placement' })) as Result;
    expect(result.pattern.layers).toEqual(['magma']);
    expect(result.layerErrors).toEqual([
      'magma/patterns/message-placement.md: narrows toast-action-stays: an "Always true" rule holds in every product, a layer cannot change it',
    ]);
  });

  test("without arguments it says what is wrong in the project's folder; a broken file breaks nothing", async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-layer-'));
    const dir = path.join(root, 'magma/patterns');
    mkdirSync(dir, { recursive: true });
    const layer = (id: string, rest = '') =>
      `---\nid: ${id}\nextends: magma:${id}\nlayer: backoffice\n${rest}---\n`;
    writeFileSync(path.join(dir, 'confirm-action.md'), '---\nid: [\n---\n');
    writeFileSync(
      path.join(dir, 'consent-and-legal.md'),
      '---\nid: consent-and-legal\nkind: pattern\ntitle: Ours\ngroup: input\nlayer: backoffice\nstatus: candidate\nneed: A need.\n---\n',
    );
    writeFileSync(path.join(dir, 'loading.md'), layer('loading'));
    writeFileSync(
      path.join(dir, 'message-placement.md'),
      layer('message-placement', 'narrows:\n  success-toast-duration: 8000\n'),
    );
    writeFileSync(path.join(dir, 'placement-again.md'), layer('message-placement'));
    writeFileSync(
      path.join(dir, 'quick-export.md'),
      '---\nid: quick-export\nkind: pattern\ntitle: Quick export\ngroup: data\nlayer: backoffice\nstatus: candidate\nneed: Export a list.\n---\n',
    );
    const tool = toolsOf({ ...context, root }).find((one) => one.name === 'get_pattern')!;

    const list = (await tool.run({})) as Result;
    expect(list.patterns.map((one: { id: string }) => one.id)).toContain('quick-export');
    expect(list.layerErrors).toEqual([
      expect.stringMatching(/^magma\/patterns\/confirm-action\.md: not read: /),
      'magma/patterns/consent-and-legal.md: Magma has a pattern consent-and-legal: extend it (extends: magma:consent-and-legal)',
      'magma/patterns/loading.md: Magma has no pattern loading',
      'magma/patterns/placement-again.md: message-placement.md extends message-placement too: one layer per pattern',
    ]);

    // the first layer of a pattern holds, so it is applied; the broken file of another is named
    const placement = (await tool.run({ id: 'message-placement' })) as Result;
    expect(placement.pattern.layers).toEqual(['magma', 'backoffice']);
    expect(placement.layerErrors).toBeUndefined();
    const confirm = (await tool.run({ id: 'confirm-action' })) as Result;
    expect(confirm.pattern.layers).toEqual(['magma']);
    expect(confirm.layerErrors).toEqual([
      expect.stringMatching(/^magma\/patterns\/confirm-action\.md: not read: /),
    ]);
    // a pattern of the project under an id Magma has never replaces Magma's
    const consent = (await tool.run({ id: 'consent-and-legal' })) as Result;
    expect(consent.pattern.title).not.toBe('Ours');
  });

  test('the values of the variables give the case to follow', async () => {
    const placement = { about: 'action', outcome: 'failure', place: 'off-screen', timing: 'now' };
    expect(await run('get_pattern', { id: 'message-placement', situation: placement })).toEqual({
      id: 'message-placement',
      answer: expect.objectContaining({
        kind: 'case',
        id: 'action-failed-elsewhere',
        use: ['mds-toast variant=error duration=0 dismissible'],
      }),
    });
    // not enough to decide: the cases still possible, and the variables that tell them apart
    const open = await run('get_pattern', {
      id: 'message-placement',
      situation: { about: 'action', outcome: 'success' },
    });
    expect(open.candidates.map((one: { id?: string }) => one.id)).toEqual([
      'action-done-elsewhere',
      'action-done-in-page',
      'action-done-in-part',
      'action-later',
    ]);
    expect(open.missing.map((one: { variable: string }) => one.variable)).toEqual([
      'place',
      'timing',
      'scope',
    ]);
    expect(
      await run('get_pattern', {
        id: 'message-placement',
        situation: { about: 'field', place: 'off-screen' },
      }),
    ).toMatchObject({
      answer: { kind: 'not-applicable', why: 'a message about a field goes with its field' },
    });
    await expect(
      run('get_pattern', { id: 'message-placement', situation: { about: 'page' } }),
    ).rejects.toThrow('about of message-placement is one of field, region, action, application');
  });

  test('a case Magma has a preview of names it; the answer for a situation gives the stage', async () => {
    const file = '../magma/agents/patterns/previews/message-placement/action-failed-in-place.html';
    const { pattern } = await run('get_pattern', { id: 'message-placement' });
    const byId = (id: string) => pattern.cases.find((one: { id: string }) => one.id === id);
    expect(byId('action-failed-in-place').preview).toBe(file);
    expect(byId('field-error').preview).toBeUndefined();
    const { answer } = await run('get_pattern', {
      id: 'message-placement',
      situation: { about: 'action', outcome: 'failure', place: 'on-screen', timing: 'now' },
    });
    expect(answer).toMatchObject({
      id: 'action-failed-in-place',
      preview: {
        file,
        try: 'Press Salva: the error shows above the form, and what was written stays.',
      },
    });
    expect(answer.preview.markup).toMatch(/^<div[\s\S]*<mds-banner id="message" variant="error"/);
    expect(answer.preview.markup).not.toMatch(/<!--/);
  });

  test('one section, a candidate as a gap, an unknown id', async () => {
    const section = await run('get_pattern', { id: 'confirm-action', section: 'behaviour' });
    expect(section).toMatchObject({ id: 'confirm-action', section: 'Behaviour over time' });
    expect(section.text).toMatch(/^- On the action: `await`/);
    expect(await run('get_pattern', { id: 'consent-and-legal' })).toMatchObject({
      pattern: { id: 'consent-and-legal', status: 'candidate' },
      gap: expect.stringContaining('no default for it yet'),
    });
    await expect(run('get_pattern', { id: 'nope' })).rejects.toThrow(
      'No pattern nope: the patterns are confirm-action, consent-and-legal, message-placement',
    );
  });
});

describe('the check tools', () => {
  test('check_markup lints a snippet with the parser of its language', async () => {
    const html = await run('check_markup', {
      code: '<mds-banner tone="outline"></mds-banner>',
      language: 'html',
    });
    expect(html.findings).toEqual([
      expect.objectContaining({ rule: 'magma/valid-attribute-values', severity: 'error', line: 1 }),
    ]);
    const angular = await run('check_markup', {
      code: '<mds-button [attr.disabled]="false">Go</mds-button>',
      language: 'angular',
    });
    expect(angular.findings.map((finding: { rule: string }) => finding.rule)).toEqual([
      'magma/no-false-boolean',
    ]);
    const jsx = await run('check_markup', {
      code: 'const a = <div className="bg-white" />;',
      language: 'jsx',
      preset: 'recommended',
    });
    expect(jsx.findings).toEqual([
      expect.objectContaining({ rule: 'magma/no-raw-palette-classes', severity: 'warning' }),
    ]);
    const css = await run('check_markup', { code: '.a { color: #333; }', language: 'css' });
    expect(css.findings).toEqual([
      expect.objectContaining({ rule: 'magma/no-raw-color', severity: 'error' }),
    ]);
    const tokens = await run('check_markup', {
      code: 'mds-book { --mds-book-spine-color: #123a6b; --mds-book-paper-color: #fff; }',
      language: 'css',
    });
    expect(tokens.findings.map((finding: { rule: string }) => finding.rule).sort()).toEqual([
      'magma/no-internal-tokens',
      'magma/no-raw-color',
    ]);
    // the palette rule reads the tokens and the consumption map of the context
    const apply = await run('check_markup', {
      code: '.a { @apply p-400 bg-tone-neutral-03; }',
      language: 'css',
      preset: 'recommended',
    });
    expect(apply.findings).toEqual([
      expect.objectContaining({
        rule: 'magma/no-raw-palette-classes',
        severity: 'warning',
        message: expect.stringMatching(/^bg-tone-neutral-03 paints with a raw Magma step/),
      }),
    ]);
    expect(
      (
        await run('check_markup', {
          code: '<mds-button label="Go"></mds-button>',
          language: 'html',
        })
      ).findings,
    ).toEqual([]);
    await expect(run('check_markup', { code: '<div', language: 'jsx' })).rejects.toThrow(
      /does not parse as jsx/,
    );
  });

  test('check_setup lists what the integration of the project misses', async () => {
    const setup = await run('check_setup');
    const byId = Object.fromEntries(
      setup.checks.map((check: { id: string; ok: boolean; detail: string }) => [check.id, check]),
    );
    expect(setup.ok).toBe(false);
    expect(byId['design-tokens']).toMatchObject({
      ok: false,
      detail: expect.stringMatching(/is not a dependency/),
    });
    expect(byId.fonts).toMatchObject({
      ok: false,
      detail: expect.stringMatching(/@fontsource\/merriweather/),
    });
    expect(byId['icon-path'].ok).toBe(true);
    expect(byId['lint-eslint'].ok).toBe(true);
    expect(byId['lint-stylelint'].ok).toBe(false);
    expect(byId.mcp.ok).toBe(true);
  });

  /** The checks of check_setup on a project made of `files`. */
  const setupOf = async (files: Record<string, string>) => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-setup-'));
    for (const [name, text] of Object.entries({ 'package.json': '{}', ...files })) {
      mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
      writeFileSync(path.join(root, name), text);
    }
    const { checks } = (await checkSetup({ ...context, root }).run({})) as Result;
    return Object.fromEntries(
      checks.map((check: { id: string; ok: boolean; detail: string }) => [check.id, check]),
    );
  };

  test('check_setup accepts every way the guides set the icon path, and only those', async () => {
    // every line of a code block of the guides that sets the path, from the guides themselves
    const repo = path.join(import.meta.dirname, '../../..');
    const guides = [
      ...readdirSync(path.join(repo, 'docs/agents')).map((name) => `docs/agents/${name}`),
      ...readdirSync(path.join(repo, 'projects/stencil/src/components/mds-icon/usage')).map(
        (name) => `projects/stencil/src/components/mds-icon/usage/${name}`,
      ),
    ].filter((name) => name.endsWith('.md'));
    const ways = guides.flatMap((name) =>
      [...readFileSync(path.join(repo, name), 'utf8').matchAll(/```\w*\n([\s\S]*?)```/g)]
        .flatMap(([, body]) => body!.split('\n'))
        .filter((line) => /setSvgPath\(|setItem\('mdsIconSvgPath'/.test(line))
        .map((line) => line.replace(/^\s*(\/\/ or: )?/, '')),
    );
    expect(ways.some((line) => line.startsWith('IconsSetService.setSvgPath('))).toBe(true);
    expect(ways.some((line) => line.includes('sessionStorage.setItem('))).toBe(true);
    for (const line of new Set(ways))
      expect((await setupOf({ 'src/main.ts': line }))['icon-path'], line).toMatchObject({
        ok: true,
      });

    // a name mds-icon never reads
    expect(
      (await setupOf({ 'src/main.ts': "window.mdsIconSvgPath = '/svg/';" }))['icon-path'],
    ).toMatchObject({
      ok: false,
      detail: expect.stringMatching(/reads the path only from IconsSetService.setSvgPath\(\)/),
    });
  });

  test('check_setup reads the lint preset from every file ESLint and Stylelint load', async () => {
    const eslint = "import magma from '@maggioli-design-system/magma/eslint';";
    const stylelint = "extends: ['@maggioli-design-system/magma/stylelint/recommended']";
    for (const name of ['eslint.config.mts', 'eslint.config.cts'])
      expect((await setupOf({ [name]: eslint }))['lint-eslint'].ok, name).toBe(true);
    for (const name of ['.stylelintrc.yml', '.config/stylelintrc.json', 'stylelint.config.ts'])
      expect((await setupOf({ [name]: stylelint }))['lint-stylelint'].ok, name).toBe(true);
    const inPackage = await setupOf({
      'package.json': JSON.stringify({
        stylelint: { extends: ['@maggioli-design-system/magma/stylelint/recommended'] },
      }),
      // package.json comes first: Stylelint never reads this file
      'stylelint.config.mjs': 'export default {};',
    });
    expect(inPackage['lint-stylelint'].ok).toBe(true);
    // the file the tool loads is the first it finds
    expect(
      (await setupOf({ '.stylelintrc.json': '{}', 'stylelint.config.mjs': stylelint }))[
        'lint-stylelint'
      ].ok,
    ).toBe(false);
  });

  test('an entry that starts magma-mcp with npx without --no is unsafe', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'magma-mcp-'));
    const file = path.join(dir, 'mcp.json');
    const entries = (config: unknown) => {
      writeFileSync(file, JSON.stringify(config));
      return mcpEntries(file);
    };
    expect(entries({ mcpServers: { magma: { command: 'npx', args: ['magma-mcp'] } } })).toEqual([
      { safe: false },
    ]);
    expect(
      entries({ servers: { magma: { command: 'npx', args: ['--no', 'magma-mcp'] } } }),
    ).toEqual([{ safe: true }]);
    expect(entries({ mcpServers: { magma: { command: 'node_modules/.bin/magma-mcp' } } })).toEqual([
      { safe: true },
    ]);
    expect(entries({ mcpServers: { other: { command: 'npx', args: ['other-mcp'] } } })).toEqual([]);
  });

  test('the Magma plugin counts as enabled only from enabledPlugins', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'magma-plugin-'));
    const file = path.join(dir, 'settings.json');
    writeFileSync(file, JSON.stringify({ enabledPlugins: { 'magma@magma': true } }));
    expect(pluginEnabled(file)).toBe(true);
    writeFileSync(file, JSON.stringify({ enabledPlugins: { 'magma@magma': false } }));
    expect(pluginEnabled(file)).toBe(false);
    expect(pluginEnabled(path.join(dir, 'missing.json'))).toBe(false);
  });

  test('satisfies reads the ranges magma declares', () => {
    expect(satisfies('15.4.0', '^15.2.2')).toBe(true);
    expect(satisfies('16.0.0', '^15.2.2')).toBe(false);
    expect(satisfies('15.2.1', '^15.2.2')).toBe(false);
    expect(satisfies('2.6.0', '>=2.5.0')).toBe(true);
    expect(satisfies('1.2.9', '~1.2.3')).toBe(true);
  });
});

describe('render_preview', () => {
  // the stand-in loader of the fixtures (mds-fixture hydrates, mds-stuck never does, mds-fail
  // throws), a project of its own for the images, the styles installed in this repository
  const root = mkdtempSync(path.join(tmpdir(), 'magma-render-'));
  const loader = path.join(fixtures, 'components/magma-components.esm.js');
  const renderContext = { ...context, root, loader };
  const preview = renderPreview(renderContext);
  /** A short render: a fixture that never hydrates would hold the default budget. */
  const shoot = async (markup: string, options: { widths?: number[]; height?: number } = {}) => {
    const [image] = await render(renderContext, {
      markup,
      widths: options.widths ?? [480],
      mode: 'light',
      ...(options.height ? { height: options.height } : {}),
      timeout: 3000,
    });
    return image!;
  };
  const kinds = (image: { problems: Array<{ kind: string }> }) =>
    image.problems.map((one) => one.kind);
  /** The size a PNG declares in its IHDR chunk. */
  const sizeOf = (file: string) => {
    const png = readFileSync(file);
    return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
  };

  test('loads the stylesheets of agents/assets.md, in its order and layers', () => {
    const guide = readFileSync(
      path.join(import.meta.dirname, '../../../docs/agents/assets.md'),
      'utf8',
    );
    const block = guide.split('### Import order (mandatory)')[1]!.split('```')[1]!;
    const imports = [...block.matchAll(/^@import '([^']+)' layer\((\w+)\);/gm)].map((one) => ({
      module: one[1]!,
      layer: one[2]!,
    }));
    expect(STYLESHEETS).toEqual(imports);
    expect(block).toContain(LAYERS);
  });

  test('a markup that renders well is representative: the image, its file and no problem', async () => {
    const result = await preview.run({ markup: '<mds-fixture>Salva</mds-fixture>', widths: [480] });
    expect(result).toMatchObject({ magma: '2.5.1', mode: 'light', representative: true });
    const [image] = result.images as Array<{
      file: string;
      width: number;
      height: number;
      problems: unknown[];
    }>;
    expect(image!.problems).toEqual([]);
    expect(image!.file.startsWith(path.join(root, PREVIEW_DIR))).toBe(true);
    // as tall as the content: the 24 px around the markup and the fixture
    expect(sizeOf(image!.file)).toEqual({ width: 480, height: image!.height });
    expect(image!.height).toBeLessThan(120);
  }, 30_000);

  test('names each problem with the element it is in', async () => {
    const stuck = await shoot('<mds-stuck>Ciao</mds-stuck>');
    expect(stuck.problems).toContainEqual(
      expect.objectContaining({ kind: 'not-hydrated', element: 'mds-stuck "Ciao"' }),
    );
    expect(stuck.representative).toBe(false);

    const unknown = await shoot('<mds-nope>Ciao</mds-nope>');
    expect(unknown.problems).toContainEqual(
      expect.objectContaining({ kind: 'unknown-component', element: 'mds-nope "Ciao"' }),
    );

    const fail = await shoot('<mds-fail></mds-fail>');
    expect(fail.problems).toContainEqual(
      expect.objectContaining({
        kind: 'console-error',
        detail: expect.stringContaining('mds-fail cannot render'),
      }),
    );

    const zero = await shoot(
      '<mds-fixture style="display: block; width: 0; padding: 0; overflow: hidden">Salva</mds-fixture>',
    );
    expect(zero.problems).toContainEqual(
      expect.objectContaining({ kind: 'zero-size', element: 'mds-fixture "Salva"' }),
    );

    const word = await shoot(
      '<div style="width: 40px; overflow-wrap: anywhere">Straordinariamente</div>',
    );
    expect(word.problems).toContainEqual(
      expect.objectContaining({
        kind: 'broken-word',
        detail: expect.stringContaining('"Straordinariamente"'),
      }),
    );
    // a line that breaks between words breaks no word
    expect(
      kinds(await shoot('<div style="width: 80px">Salva e chiudi la scheda</div>')),
    ).not.toContain('broken-word');
  }, 60_000);

  test('catches a blank or grey region: a component whose content does not show, an empty image', async () => {
    // the text painted in the colour of the fixture's own background
    const hidden = await shoot('<mds-fixture style="color: #2563eb">Salva</mds-fixture>');
    expect(hidden.problems).toContainEqual(
      expect.objectContaining({
        kind: 'flat',
        element: 'mds-fixture "Salva"',
        detail: expect.stringContaining('#2563eb'),
      }),
    );
    const empty = await shoot('<p hidden>Nothing shows</p>');
    expect(empty.problems).toContainEqual(
      expect.objectContaining({
        kind: 'flat',
        detail: expect.stringMatching(/^The whole image is one flat colour/),
      }),
    );
    // a component with no content of its own may be one colour
    expect(kinds(await shoot('<mds-fixture></mds-fixture>'))).not.toContain('flat');
  }, 60_000);

  test('serves only the installed packages, offline, and reports what did not load', async () => {
    const [icon] = readdirSync(path.join(fixtures, 'icons/mgg'));
    const image = await shoot(
      `<img src="https://example.com/logo.png" alt="Logo" width="40" height="40">
<script>fetch('/svg/mgg/${icon}'); fetch('/svg/mgg/no-such-icon.svg'); fetch('/node_modules/vitest/package.json');</script>`,
    );
    const details = image.problems.filter((one) => one.kind === 'asset').map((one) => one.detail);
    expect(details).toContainEqual(
      expect.stringContaining('https://example.com/logo.png was not loaded'),
    );
    expect(details).toContainEqual(
      expect.stringContaining('The icon mgg/no-such-icon is not in the icon sets'),
    );
    expect(details).toContainEqual(expect.stringContaining('/node_modules/vitest/package.json'));
    expect(details.join()).not.toContain(icon);
    expect(image.problems).toContainEqual(
      expect.objectContaining({
        kind: 'asset',
        element: 'img',
        detail: expect.stringContaining('did not load'),
      }),
    );
  }, 30_000);

  test('reports a font with no face loaded, and content cut at the longest side', async () => {
    const font = await shoot('<p style="font-family: \'Nope Sans\', sans-serif">Testo</p>');
    expect(font.problems).toContainEqual(
      expect.objectContaining({ kind: 'font', detail: expect.stringContaining('Nope Sans') }),
    );
    const tall = await shoot(`<div style="height: ${MAX_SIDE + 500}px">Lungo</div>`);
    expect(kinds(tall)).toContain('cut');
    expect(sizeOf(tall.file).height).toBe(MAX_SIDE);
  }, 30_000);

  test('renders in the mode asked: prefers-color-scheme of the page', async () => {
    const markup =
      "<script>console.error(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')</script>";
    const [dark] = await render(renderContext, {
      markup,
      widths: [480],
      mode: 'dark',
      timeout: 3000,
    });
    expect(dark!.problems).toContainEqual({ kind: 'console-error', detail: 'dark' });
  }, 30_000);

  test('reads the widths and the themes from the installed styles, and refuses the rest', async () => {
    const breakpoints = breakpointsOf(renderContext);
    expect(breakpoints[DEFAULT_WIDTH]).toBeTypeOf('number');
    const result = await preview.run({
      markup: '<mds-fixture>Salva</mds-fixture>',
      widths: ['mobile'],
    });
    expect((result.images as Array<{ width: number }>)[0]!.width).toBe(breakpoints.mobile);
    await expect(preview.run({ markup: 'x', widths: ['huge'] })).rejects.toThrow(
      /No breakpoint huge: the installed styles name .*desktop/,
    );
    await expect(preview.run({ markup: 'x', widths: [100] })).rejects.toThrow(/from 320 to 2000/);
    await expect(preview.run({ markup: 'x', widths: [400, 500, 600, 700, 800] })).rejects.toThrow(
      /At most 4/,
    );
    await expect(preview.run({ markup: 'x', theme: 'neon' })).rejects.toThrow(
      new RegExp(`No theme neon: the installed styles name ${themesOf(renderContext).join(', ')}`),
    );
    await expect(preview.run({ markup: 'x', lang: '"><script>' })).rejects.toThrow(
      /lang is a language tag/,
    );
    await expect(preview.run({ markup: ' ' })).rejects.toThrow(/Give the markup/);
  }, 30_000);

  test('renders the preview of a case, at the height it declares', async () => {
    const result = await preview.run({
      pattern: 'message-placement',
      case: 'region-info',
      widths: [480],
    });
    expect(result).toMatchObject({
      representative: true,
      preview: {
        pattern: 'message-placement',
        case: 'region-info',
        file: expect.stringMatching(
          /agents\/patterns\/previews\/message-placement\/region-info\.html$/,
        ),
        try: 'Look at the message in the region.',
      },
    });
    const [image] = result.images as Array<{ file: string; height: number }>;
    expect(image!.height).toBe(300);
    expect(sizeOf(image!.file)).toEqual({ width: 480, height: 300 });
  }, 30_000);

  test('a case with no preview, or markup and a case together, are refused', async () => {
    await expect(
      preview.run({ pattern: 'message-placement', case: 'field-error' }),
    ).rejects.toThrow(
      'No preview of the case field-error of message-placement: the cases with one are action-failed-in-place, region-info.',
    );
    await expect(preview.run({ pattern: 'confirm-action', case: 'ask-first' })).rejects.toThrow(
      'confirm-action has no preview of its cases in this magma yet.',
    );
    await expect(preview.run({ pattern: 'nope', case: 'x' })).rejects.toThrow(
      /^No pattern nope in this magma: the patterns are /,
    );
    await expect(preview.run({ pattern: 'message-placement' })).rejects.toThrow(
      'Give both pattern and case, to render the preview of a case.',
    );
    await expect(
      preview.run({
        markup: '<mds-fixture>x</mds-fixture>',
        pattern: 'message-placement',
        case: 'region-info',
      }),
    ).rejects.toThrow('Give markup, or pattern and case: not both.');
    await expect(preview.run({})).rejects.toThrow(
      'Give the markup to render, or pattern and case.',
    );
  });

  test('answers tools/call with the images as image content, after the text', async () => {
    const { handle } = createServer(renderContext);
    const answer = (await handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'render_preview',
        arguments: { markup: '<mds-fixture>Salva</mds-fixture>', widths: [480, 640] },
      },
    })) as Result;
    const { content, structuredContent } = answer.result;
    expect(content.map((one: { type: string }) => one.type)).toEqual(['text', 'image', 'image']);
    expect(content[1]).toMatchObject({
      mimeType: 'image/png',
      data: expect.stringMatching(/^iVBORw0KGgo/),
    });
    // the structured content, and its text, carry the files and never the image data
    expect(JSON.stringify(structuredContent)).not.toContain('iVBORw0KGgo');
    expect(JSON.parse(content[0].text)).toEqual(structuredContent);
  }, 30_000);
});

// the components of the build of this repository: the real hydration, the real styles
const BUILT = path.join(
  import.meta.dirname,
  '../../stencil/dist/magma-components/magma-components.esm.js',
);
describe.skipIf(!existsSync(BUILT) && !process.env.CI)('render_preview on the built magma', () => {
  test('mds-button hydrates, shows its label and looks different in dark mode', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-render-built-'));
    const built = { root, settings: { root } };
    const markup = '<mds-button>Salva</mds-button>';
    const [light] = await render(built, { markup, widths: [480], mode: 'light' });
    const [dark] = await render(built, { markup, widths: [480], mode: 'dark' });
    expect(light!.problems).toEqual([]);
    expect(dark!.problems).toEqual([]);
    expect(readFileSync(light!.file).equals(readFileSync(dark!.file))).toBe(false);
  }, 60_000);

  test('every preview of a case Magma ships renders representative', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'magma-render-previews-'));
    const built = { root, settings: { root } };
    const previews = readPreviews(path.join(import.meta.dirname, '../../../docs/agents/patterns'));
    expect(previews.length).toBeGreaterThan(0);
    for (const one of previews) {
      const [image] = await render(built, {
        markup: one.markup,
        widths: [480],
        mode: 'light',
        lang: 'it',
        ...(one.height ? { height: one.height } : {}),
      });
      expect({ preview: `${one.pattern}/${one.case}`, problems: image!.problems }).toEqual({
        preview: `${one.pattern}/${one.case}`,
        problems: [],
      });
    }
  }, 120_000);
});
