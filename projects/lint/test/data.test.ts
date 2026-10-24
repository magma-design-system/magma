// What the rules read from the installed packages, on fixtures cut from the real data.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { loadComponents, loadPalette, loadStyles, locate, propInfo } from '../src/core/data.js';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const settings = {
  root: fixtures,
  documentation: 'magma/data/documentation.json',
  tokens: 'design-tokens/base.tokens.json',
  consumption: 'styles/consumption.json',
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
  for (const key of ['tone-neutral-03', 'status-error-04', 'surface-neutral-default'])
    expect(rawKeys.has(key)).toBe(true);
  for (const key of [
    'label-sky-09',
    'brand-maggioli-04',
    'tone-neutral-seed',
    'surface-raised',
    'fg-muted',
  ])
    expect(rawKeys.has(key)).toBe(false);
  expect(colorUtilities).toContain('bg');
  // longest first, so `border-t` wins over `border`
  expect(colorUtilities.indexOf('border-t')).toBeLessThan(colorUtilities.indexOf('border'));
});

test('the custom properties carry their contract, and a public one wins across components', () => {
  const styles = loadStyles(settings);
  expect(styles.get('--mds-button-radius')).toEqual({
    name: '--mds-button-radius',
    tags: ['mds-button'],
    visibility: 'public',
    static: false,
  });
  expect(styles.get('--mds-book-spine-color')).toMatchObject({
    visibility: 'public',
    static: true,
  });
  expect(styles.get('--mds-button-await-duration')?.visibility).toBe('internal');
  expect(styles.has('--mds-button-nope')).toBe(false);
});

test('a setting that names a missing file says so', () => {
  expect(() => locate('documentation', { root: fixtures, documentation: 'missing.json' })).toThrow(
    /The "documentation" setting of the Magma lint names .*missing\.json, which does not exist/,
  );
});
