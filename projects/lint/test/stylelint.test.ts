// The CSS rules, through Stylelint itself.
import stylelint from 'stylelint';
import { describe, expect, test } from 'vitest';

import { colorLiterals } from '../src/core/colors.js';
import plugins from '../src/stylelint/index.js';
import recommended from '../src/stylelint/recommended.js';

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
