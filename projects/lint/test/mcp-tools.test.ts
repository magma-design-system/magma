// The ten tools of the MCP server on fixtures cut from the real data, and the mi and mdi icon
// sets installed in this repository.
import { describe, expect, test } from 'vitest';

import { satisfies } from '../src/mcp/checks.js';
import { distance, parseColor } from '../src/mcp/color.js';
import { toolsOf } from '../src/mcp/server.js';
import { context } from './mcp-context.js';

const tools = Object.fromEntries(toolsOf(context).map((tool) => [tool.name, tool]));
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the tests read the structured content of each tool freely
const run = async (
  name: string,
  args: Record<string, unknown> = {},
): Promise<Record<string, any>> => tools[name]!.run(args);

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

  test('satisfies reads the ranges magma declares', () => {
    expect(satisfies('15.4.0', '^15.2.2')).toBe(true);
    expect(satisfies('16.0.0', '^15.2.2')).toBe(false);
    expect(satisfies('15.2.1', '^15.2.2')).toBe(false);
    expect(satisfies('2.6.0', '>=2.5.0')).toBe(true);
    expect(satisfies('1.2.9', '~1.2.3')).toBe(true);
  });
});
