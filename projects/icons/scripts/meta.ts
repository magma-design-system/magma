import path from 'path';
const ROOT_DIR = path.join(__dirname, '../');
const DIST_DIR = path.resolve(__dirname, '../dist');
const ORIGINAL_DIR = path.join(DIST_DIR, 'original');
const DICTIONARY_PATH = path.resolve(ROOT_DIR, 'dictionary.json');
const UNMAPPED_ALLOWLIST_PATH = path.resolve(ROOT_DIR, 'unmapped-icons.json');

/**
 * Maggioli SVG sources. Resolved through the package entry (a Yarn workspace
 * symlink to projects/svg-icons) so it matches what the font build reads.
 */
const MAGGIOLI_ICONS_DIR = path.join(
  path.dirname(require.resolve('@maggioli-design-system/svg-icons/package.json')),
  'svg',
);

export {
  ROOT_DIR,
  ORIGINAL_DIR,
  DIST_DIR,
  DICTIONARY_PATH,
  MAGGIOLI_ICONS_DIR,
  UNMAPPED_ALLOWLIST_PATH,
};
