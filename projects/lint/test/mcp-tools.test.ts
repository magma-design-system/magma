// The ten tools of the MCP server on fixtures cut from the real data, and the mi and mdi icon
// sets installed in this repository.
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { checkSetup, mcpEntries, pluginEnabled, satisfies } from '../src/mcp/checks.js';
import { distance, parseColor } from '../src/mcp/color.js';
import { toolsOf } from '../src/mcp/server.js';
import { context } from './mcp-context.js';

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

test('the server has its ten tools', () => {
  expect(Object.keys(tools).sort()).toEqual([
    'check_markup',
    'check_setup',
    'explain_class',
    'find_component',
    'find_icon',
    'get_component',
    'get_guide',
    'get_usage',
    'list_tokens',
    'suggest_role',
  ]);
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
