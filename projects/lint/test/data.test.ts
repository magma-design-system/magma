// What the rules read from the installed packages, on fixtures cut from the real data.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { loadComponents, loadPalette, locate, propInfo } from '../src/core/data.js';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const settings = {
  root: fixtures,
  documentation: 'documentation.json',
  tokens: 'base.tokens.json',
  consumption: 'consumption.json',
};

describe('propInfo', () => {
  test('a union of literals is closed, a string or a number open', () => {
    expect(
      propInfo({
        name: 'tone',
        attr: 'tone',
        values: [
          { value: 'box', type: 'string' },
          { value: 'weak', type: 'string' },
          { type: 'undefined' },
        ],
      }),
    ).toEqual({ name: 'tone', attr: 'tone', boolean: false, values: ['box', 'weak'] });
    expect(
      propInfo({ name: 'label', values: [{ type: 'string' }, { type: 'undefined' }] }),
    ).toEqual({
      name: 'label',
      boolean: false,
    });
    expect(
      propInfo({ name: 'size', values: [{ value: 'sm', type: 'string' }, { type: 'string' }] })
        .values,
    ).toBeUndefined();
    expect(propInfo({ name: 'disabled', values: [{ type: 'boolean' }] }).boolean).toBe(true);
  });
});

test('the components answer by prop name and by attribute', () => {
  const button = loadComponents(settings).get('mds-button');
  expect(button?.defaultSlot).toBe(true);
  expect(button?.props.get('disabled')?.boolean).toBe(true);
  expect(button?.props.get('variant')?.values).toContain('primary');
  expect(loadComponents(settings).get('mds-input')?.defaultSlot).toBe(false);
});

test('the raw palette keys leave out label, brand, the seed and the roles', () => {
  const { rawKeys, colorUtilities } = loadPalette(settings);
  expect([...rawKeys].sort()).toEqual([
    'status-error-04',
    'surface-neutral-default',
    'tone-neutral-01',
    'tone-neutral-03',
  ]);
  expect(colorUtilities).toContain('bg');
  // longest first, so `border-t` wins over `border`
  expect(colorUtilities.indexOf('border-t')).toBeLessThan(colorUtilities.indexOf('border'));
});

test('a missing package says what to install or set', () => {
  expect(() => locate('documentation', { root: '/' })).toThrow(
    /install @maggioli-design-system\/magma, or set its path in the "documentation" setting/,
  );
});
