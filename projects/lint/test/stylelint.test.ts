// The CSS rules, through Stylelint itself; the ones that read the installed API read the
// fixtures cut from the real data (test/fixtures).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, test } from 'vitest';

import { colorLiterals } from '../src/core/colors.js';
import { lintGuideUrl } from '../src/core/data.js';
import plugins from '../src/stylelint/index.js';
import recommended from '../src/stylelint/recommended.js';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const data = { documentation: path.join(fixtures, 'magma/data/documentation.json') };

const lint = async (code: string, rules: Record<string, unknown>) => {
  const { results } = await stylelint.lint({ code, config: { plugins, rules } });
  return results[0]!.warnings.map(({ rule, text, severity }) => ({ rule, text, severity }));
};

describe('colorLiterals', () => {
  test('finds hex words and colour functions that name no token', () => {
    expect(colorLiterals('0 1px 2px rgb(0 0 0 / 0.1), 0 0 0 1px #fff')).toEqual([
      'rgb(0 0 0 / 0.1)',
      '#fff',
    ]);
    expect(colorLiterals('oklch(70% 0.1 200)')).toEqual(['oklch(70% 0.1 200)']);
    expect(colorLiterals('color-mix(in srgb, var(--a), #102030)')).toEqual(['#102030']);
  });

  test('lets roles, keywords and urls through', () => {
    expect(colorLiterals('rgb(var(--magma-text-muted) / 0.5)')).toEqual([]);
    expect(colorLiterals('rgb(from var(--magma-accent-fg) r g b / 0.4)')).toEqual([]);
    expect(colorLiterals('currentColor transparent inherit')).toEqual([]);
    expect(colorLiterals('url(#fff) var(--x, #fff)')).toEqual([]);
    expect(colorLiterals('#abcde')).toEqual([]);
  });
});

describe('magma/no-raw-color', () => {
  test('rejects a literal, with the shadow ink for a shadow', async () => {
    const warnings = await lint('.a { color: #333; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }', {
      'magma/no-raw-color': true,
    });
    expect(warnings).toHaveLength(2);
    expect(warnings[0]!.text).toMatch(/Unexpected colour literal "#333": paint with a role/);
    expect(warnings[1]!.text).toMatch(/rgb\(var\(--magma-shadow-ink\) \/ <alpha>\)/);
  });

  test('lets roles, masks and registrations through', async () => {
    const warnings = await lint(
      [
        '.a { color: rgb(var(--magma-text-muted)); mask-image: linear-gradient(#000, transparent); }',
        "@property --x { syntax: '<color>'; inherits: true; initial-value: #fff; }",
      ].join('\n'),
      { 'magma/no-raw-color': true },
    );
    expect(warnings).toEqual([]);
  });
});

describe('magma/no-raw-color on the static custom properties', () => {
  test('lets a static one take a colour of its own, not the others', async () => {
    const warnings = await lint(
      'mds-book { --mds-book-spine-color: #123a6b; --mds-book-paper-color: #fff; }',
      { 'magma/no-raw-color': [true, data] },
    );
    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringMatching(/Unexpected colour literal "#fff"/),
    ]);
  });
});

describe('magma/no-internal-tokens', () => {
  test('rejects an internal custom property, set or read, and names its component', async () => {
    const warnings = await lint(
      [
        '.a { --mds-button-await-duration: 2s; }',
        '.b { color: var(--mds-button-color); margin: var(--mds-chip-icon-color, 0); }',
      ].join('\n'),
      { 'magma/no-internal-tokens': [true, data] },
    );
    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringMatching(
        /^"--mds-button-await-duration" is an internal custom property of <mds-button>: it may change in any release/,
      ),
      expect.stringMatching(
        /^"--mds-chip-icon-color" is an internal custom property of <mds-chip>/,
      ),
    ]);
  });

  test('reads the classes of @apply, as the templates write them', async () => {
    const warnings = await lint(
      [
        '.a { @apply p-400 dark:![--mds-chip-icon-color:red]; }',
        '.b { @apply [--mds-text-line-clamp:2] bg-(--mds-button-nope); }',
      ].join('\n'),
      { 'magma/no-internal-tokens': [true, data] },
    );
    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringMatching(
        /^"--mds-chip-icon-color" is an internal custom property of <mds-chip>/,
      ),
      expect.stringMatching(/^"--mds-button-nope" is not a custom property any Magma component/),
    ]);
  });

  test('rejects a name no component documents', async () => {
    const warnings = await lint('.a { --mds-button-nope: 0; }', {
      'magma/no-internal-tokens': [true, data],
    });
    expect(warnings.map(({ text }) => text)).toEqual([
      expect.stringMatching(
        /^"--mds-button-nope" is not a custom property any Magma component promises/,
      ),
    ]);
  });

  test('lets the public ones, static included, and the other custom properties through', async () => {
    const warnings = await lint(
      [
        'mds-button { --mds-button-radius: var(--magma-radius-md); --gap: 4px; }',
        'mds-book { --mds-book-color: #f2a93b; color: var(--mds-text-line-clamp); }',
      ].join('\n'),
      { 'magma/no-internal-tokens': [true, data] },
    );
    expect(warnings).toEqual([]);
  });
});

describe('magma/no-color-scheme-override', () => {
  test('rejects a prefers-color-scheme query', async () => {
    const warnings = await lint(
      '@media (prefers-color-scheme: dark) { .a { color: rgb(var(--magma-text-muted)); } }\n@media (min-width: 40rem) { .b { color: inherit; } }',
      { 'magma/no-color-scheme-override': true },
    );
    expect(warnings.map(({ rule }) => rule)).toEqual(['magma/no-color-scheme-override']);
    expect(warnings[0]!.text).toMatch(/not the mode the user picked in Magma/);
  });
});

test('the recommended preset warns on an internal custom property', async () => {
  const { results } = await stylelint.lint({
    code: '.a { --mds-button-await-duration: 2s; }',
    config: {
      ...recommended,
      rules: {
        ...recommended.rules,
        'magma/no-internal-tokens': [true, { ...data, severity: 'warning' }],
      },
    },
  });
  expect(results[0]!.warnings.map(({ rule, severity }) => `${rule} ${severity}`)).toEqual([
    'magma/no-internal-tokens warning',
  ]);
});

test('the recommended preset warns on a colour and stops on a colour-scheme query', async () => {
  const { results } = await stylelint.lint({
    code: '.a { color: #333; }\n@media (prefers-color-scheme: dark) { .a { color: inherit; } }',
    config: recommended,
  });
  expect(results[0]!.warnings.map(({ rule, severity }) => `${rule} ${severity}`).sort()).toEqual([
    'magma/no-color-scheme-override error',
    'magma/no-raw-color warning',
  ]);
});

/** The headings of docs/agents/lint.md, as GitHub anchors them. */
const guideAnchors = () =>
  [
    ...readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../docs/agents/lint.md'),
      'utf8',
    ).matchAll(/^#+ (.+)$/gm),
  ].map(([, heading]) =>
    heading!
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/ /g, '-'),
  );

test('every rule describes itself and links its section of the guide, as the ESLint ones', () => {
  const anchors = guideAnchors();
  for (const { ruleName, rule } of plugins) {
    const name = ruleName.replace(/^magma\//, '');
    const meta = rule.meta as { url: string; description?: string };
    expect(meta.description, name).toMatch(/^[A-Z].+\.$/);
    expect(meta.url, name).toBe(lintGuideUrl(name));
    expect(anchors, name).toContain(name);
  }
});
