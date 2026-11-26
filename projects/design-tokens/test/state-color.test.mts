// The states generated for a family (#1427): washes by lightness, the band of a solid fill and
// its selected state, the selected level of the inverse pair of a tint.
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import { expect, test } from 'vitest';

import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs';
import { DEFAULT_TARGETS } from '../src/lib/contrast-gate.js';
import { validateConfig } from '../src/lib/schema.mjs';
import { keyColorOf, midpoint, washedColors } from '../src/lib/state-color.mjs';
import { parseLightness, taper } from '../src/lib/surface.mjs';
import { getColorsConfig } from '../src/lib/utils.mjs';
import { WASH_LEVELS } from '../src/lib/wash.js';

type Tree = Record<string, Record<string, Record<'light' | 'dark', Record<string, { value: string }>>>>;

const load = async () => {
  const rc = await getColorsConfig();
  const config = rc!.config as MagmaConfig;
  const tree = (createColorTokens(config).tokens as { color: Tree }).color;
  return { config, tree };
};
const L = (hex: string) => chroma(hex).oklch()[0];
const C = (hex: string) => chroma(hex).oklch()[1] || 0;
const lc = (fg: string, bg: string) =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

test('every family with surfaces or a solid fill has its washes, the accents included', async () => {
  const { config, tree } = await load();
  const families = washedColors(config).map((color) => color.name.split('.')[1]);
  expect(families).toEqual(expect.arrayContaining(['neutral', 'bisque', 'error', 'primary', 'ai']));
  for (const family of families) {
    for (const mode of ['light', 'dark'] as const) {
      expect(Object.keys(tree.wash[family][mode])).toEqual(Object.keys(WASH_LEVELS));
    }
  }
});

test('a wash sits at its distance from the page: below it in light, above it in dark', async () => {
  const { config, tree } = await load();
  const surfaces = config.theme!.surfaces;
  const page = { light: parseLightness(surfaces.light.default), dark: parseLightness(surfaces.dark.default) };
  for (const family of ['neutral', 'primary', 'error']) {
    for (const [level, distance] of Object.entries(WASH_LEVELS)) {
      // a hex rounds the lightness to about half a unit
      expect(L(tree.wash[family].light[level].value)).toBeCloseTo(page.light - distance / 100, 2);
      expect(L(tree.wash[family].dark[level].value)).toBeCloseTo(page.dark + distance / 100, 2);
    }
  }
});

test('the chroma of a wash is bounded by its paler end, in both modes', async () => {
  const { tree } = await load();
  const keyChroma = C('#00379E');
  for (const level of Object.keys(WASH_LEVELS)) {
    const light = tree.wash.primary.light[level].value;
    const dark = tree.wash.primary.dark[level].value;
    // keyC x min(taper(L light), taper(L dark)); the gamut may take a little more away in light
    const bound = keyChroma * Math.min(taper(L(light)), taper(L(dark)));
    expect(C(light)).toBeLessThanOrEqual(bound + 0.002);
    expect(C(dark)).toBeLessThanOrEqual(bound + 0.002);
  }
  // the light wash of the brand accent is coloured, no longer the grey of its HSL ramp (C < 0.022)
  expect(C(tree.wash.primary.light.base.value)).toBeGreaterThan(0.04);
  // and the dark one is no brick: well under the chroma of the ramp step it replaces (0.204)
  expect(C(tree.wash.primary.dark.base.value)).toBeLessThan(0.08);
});

test('the brand accent places its dark band by lightness, the AI accent keeps its ramp', async () => {
  const { tree } = await load();
  // light: the steps of the ramp, unchanged
  expect(tree.emphasis.primary.light.default.value).toBe(tree.variant.primary.light['4'].value);
  // dark: at the lightness of its step (L 83.9), and more coloured than the step: the ramp was
  // grey there (C 0.031) until the palette of #1460, which gives it C 0.069 (the band: 0.080)
  expect(tree.emphasis.primary.dark.default.value).toBe('#aecbff');
  expect(L(tree.emphasis.primary.dark.default.value)).toBeCloseTo(
    L(tree.variant.primary.dark['4'].value),
    2,
  );
  expect(C(tree.emphasis.primary.dark.default.value)).toBeGreaterThan(
    C(tree.variant.primary.dark['4'].value),
  );
  expect(tree.emphasis.ai.dark.default.value).toBe(tree.variant.ai.dark['4'].value);
  // a status hue keeps its ramp too
  expect(tree.emphasis.error.dark.hover.value).toBe(tree.status.error.dark['3'].value);
});

test('a band placed by lightness keeps the ink of its fill on the page of every tint', async () => {
  const { tree } = await load();
  const pages = ['neutral', 'porcelain', 'bisque'].map((tint) => tree.surface[tint].dark.default.value);
  for (const family of ['primary', 'secondary']) {
    for (const state of ['default', 'hover', 'active', 'selected']) {
      for (const page of pages) {
        expect(lc(page, tree.emphasis[family].dark[state].value)).toBeGreaterThanOrEqual(
          DEFAULT_TARGETS.onEmphasis.dark - 0.05,
        );
      }
    }
  }
});

test('the selected state is the OKLCH midpoint of the rest and the hover', async () => {
  const { tree } = await load();
  for (const mode of ['light', 'dark'] as const) {
    const band = tree.emphasis.error[mode];
    expect(band.selected.value).toBe(midpoint(band.default.value, band.hover.value));
    const ramp = tree.tone.neutral[mode];
    expect(tree.inverse.neutral[mode].selected.value).toBe(midpoint(ramp['2'].value, ramp['3'].value));
  }
  // an achromatic end takes the hue of the other
  expect(C(midpoint('#808080', '#2467e7'))).toBeGreaterThan(0.05);
});

test('an alias takes the key colour of the family it aliases', async () => {
  const { config } = await load();
  const primary = config.colors.find((color) => color.name === 'variant.primary')!;
  expect(keyColorOf(config, primary)).toBe('#00379E');
});

test('the schema takes the emphasis opt-in on a group and on a color', async () => {
  const { config } = await load();
  expect(validateConfig(config)).toEqual({ valid: true, errors: [] });
  const wrong = structuredClone(config) as unknown as { groups: Record<string, { emphasis: unknown }> };
  wrong.groups.variant.emphasis = { dark: 'contrast' };
  expect(validateConfig(wrong).valid).toBe(false);
});
