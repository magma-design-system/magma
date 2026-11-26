import { zipSync } from 'fflate';
import {
  createColorTokens,
  type MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  colorsToDtcg,
  type ColorTokenTree,
} from '@maggioli-design-system/design-tokens/src/lib/dtcg.mjs';
import { cssHex, cssRgb, gimpPalette } from './formats.js';

/*
  What the Config menu of the bar hands over, as files (#1400, out of app.tsx): the configuration,
  its tokens in the formats of the build of design-tokens, or a zip of all of them. Pure: the
  configuration in, the file out; the action that downloads it is state/exports.ts.
*/

/** A file handed to the person: its name, its content, its media type. */
export interface FileOut {
  name: string;
  data: string | Uint8Array;
  type: string;
}

/** What the Config menu exports, by the id of its action (app/config-menu.tsx). */
export type ExportKind = 'zip' | 'config' | 'figma' | 'css' | 'gimp';

type ColorTree = Parameters<typeof cssHex>[0];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** The configuration as the file the build of design-tokens reads. */
const configText = (config: MagmaConfig): string => JSON.stringify(config, null, 2) + '\n';

// The whole palette plus one entry per export group; formats that respect
// export diversification (CSS, GIMP) emit one file per entry. The whole
// palette carries an empty suffix, groups carry "-<group>".
const exportTrees = (
  tokens: ColorTree,
  exportGroups: Record<string, unknown>,
): Array<{ suffix: string; tree: ColorTree }> => [
  { suffix: '', tree: tokens },
  ...Object.keys(exportGroups).map((group) => ({
    suffix: `-${group}`,
    tree: exportGroups[group] as ColorTree,
  })),
];

const cssFiles = (
  tokens: ColorTree,
  exportGroups: Record<string, unknown>,
  date: string,
): Record<string, string> => {
  const files: Record<string, string> = {};
  exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
    files[`colors-hex${suffix}.css`] = cssHex(tree, date);
    files[`colors-rgb${suffix}.css`] = cssRgb(tree, date);
  });
  return files;
};

const gimpFiles = (
  tokens: ColorTree,
  exportGroups: Record<string, unknown>,
): Record<string, string> => {
  const files: Record<string, string> = {};
  exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
    // the whole palette keeps the classic name, groups take the group name
    files[`${suffix ? suffix.slice(1) : 'colors'}.gpl`] = gimpPalette(tree);
  });
  return files;
};

/** Text files zipped under their paths. */
const zipOf = (files: Record<string, string>): Uint8Array => {
  const encoder = new TextEncoder();
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([path, text]) => [path, encoder.encode(text)])),
  );
};

/** A set of text files: a single one as it is, several as a zip. */
const oneOrZip = (files: Record<string, string>, zipName: string, singleType: string): FileOut => {
  const names = Object.keys(files);
  if (names.length === 1) return { name: names[0], data: files[names[0]], type: singleType };
  return { name: zipName, data: zipOf(files), type: 'application/zip' };
};

/**
 * The files of a configuration under the paths of the dist of design-tokens: the generated JSON
 * tokens (the whole palette, then one file per export group unless `groups` is false,
 * byte-for-byte the CLI files, no newline) and the CSS and GIMP renders, both diversified per
 * export group.
 */
function distFiles(config: MagmaConfig, date: string, groups = true): Record<string, string> {
  const { tokens, exportGroups } = createColorTokens(clone(config));
  const files: Record<string, string> = {
    'tokens/color/generated/base.json': JSON.stringify(tokens, null, 2),
  };
  if (groups)
    Object.keys(exportGroups).forEach((group) => {
      files[`tokens/color/generated/${group}.json`] = JSON.stringify(exportGroups[group], null, 2);
    });
  const css = cssFiles(tokens as ColorTree, exportGroups, date);
  Object.keys(css).forEach((name) => (files[`css/${name}`] = css[name]));
  const gimp = gimpFiles(tokens as ColorTree, exportGroups);
  Object.keys(gimp).forEach((name) => (files[`gimp/${name}`] = gimp[name]));
  return files;
}

/**
 * The file of an export of the configuration; it throws when the generator refuses the
 * configuration. `date` stamps the CSS files, as the build of design-tokens does.
 */
export function exportOf(
  config: MagmaConfig,
  kind: ExportKind,
  date: string = new Date().toUTCString(),
): FileOut {
  if (kind === 'config')
    return {
      name: 'magma-design-tokensrc.json',
      data: configText(config),
      type: 'application/json',
    };
  if (kind === 'zip')
    // the zip mirrors the dist output, the configuration first
    return {
      name: 'magma-design-tokens.zip',
      data: zipOf({ 'magma-design-tokensrc.json': configText(config), ...distFiles(config, date) }),
      type: 'application/zip',
    };
  const { tokens, exportGroups } = createColorTokens(clone(config));
  if (kind === 'css')
    return oneOrZip(cssFiles(tokens as ColorTree, exportGroups, date), 'magma-css.zip', 'text/css');
  if (kind === 'gimp')
    return oneOrZip(gimpFiles(tokens as ColorTree, exportGroups), 'magma-gimp.zip', 'text/plain');
  // DTCG color tokens for Figma: one file per theme mode, zipped together. Matches the package
  // build output (dist/json/figma-magma-colors-*.tokens.json).
  const color = (tokens as ColorTree).color as unknown as ColorTokenTree;
  return oneOrZip(
    {
      'figma-magma-colors-light.tokens.json':
        JSON.stringify(colorsToDtcg(color, 'light'), null, 2) + '\n',
      'figma-magma-colors-dark.tokens.json':
        JSON.stringify(colorsToDtcg(color, 'dark'), null, 2) + '\n',
    },
    'magma-figma-dtcg.zip',
    'application/json',
  );
}

/**
 * The tokens of the families named alone, zipped as the dist (the Batch export of Groups): the
 * whole palette of the selection, its CSS and GIMP renders.
 */
export function selectionOf(
  config: MagmaConfig,
  names: string[],
  date: string = new Date().toUTCString(),
): FileOut {
  const target = new Set(names);
  const subset = { ...clone(config), colors: config.colors.filter((one) => target.has(one.name)) };
  return {
    name: 'magma-selection.zip',
    data: zipOf(distFiles(subset, date, false)),
    type: 'application/zip',
  };
}
