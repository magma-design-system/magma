import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { DeckConfig, Scheme, ThemeManifest } from '../model/types.js';

/** Theme used when a deck does not set one (Magma's default theme). */
export const DEFAULT_THEME = 'business';

/** Scheme used when a deck does not set one. */
export const DEFAULT_SCHEME: Scheme = 'light';

/** Absolute path to a file inside a theme folder (src in dev, dist when built). */
export const themePath = (theme: string, file: string): string =>
  fileURLToPath(new URL(`../theme/themes/${theme}/${file}`, import.meta.url));

/**
 * The theme folder to use: the deck's theme when the package ships it, else the
 * default. The name doubles as the Magma `data-theme-name`, so a slide theme and
 * the Magma color theme it pairs with are always the same word.
 */
export function resolveTheme(theme: string | undefined): string {
  const name = theme ?? DEFAULT_THEME;
  // The name reaches a file path and an HTML attribute: only a plain slug.
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return DEFAULT_THEME;
  return existsSync(themePath(name, 'theme.json')) ? name : DEFAULT_THEME;
}

/** Map a deck scheme to the root class that drives Magma's light/dark flip. */
export function resolveSchemeClass(scheme: Scheme | undefined): string {
  return (scheme ?? DEFAULT_SCHEME) === 'dark'
    ? 'pref-theme-scheme-dark'
    : 'pref-theme-scheme-light';
}

const manifestCache = new Map<string, ThemeManifest>();

/**
 * Read a theme's manifest (`themes/<name>/theme.json`). A `logo` entry is
 * returned as an absolute path, which `embedImages` inlines on export.
 */
export function loadTheme(theme: string | undefined): ThemeManifest {
  const name = resolveTheme(theme);
  let manifest = manifestCache.get(name);
  if (!manifest) {
    manifest = JSON.parse(readFileSync(themePath(name, 'theme.json'), 'utf8')) as ThemeManifest;
    if (manifest.logo) manifest = { ...manifest, logo: themePath(name, manifest.logo) };
    manifestCache.set(name, manifest);
  }
  return manifest;
}

/** Build the inline `:root` block for per-deck `tokens:` overrides (cascade level 3). */
export function renderTokenOverrides(config: DeckConfig): string {
  const tokens = config.tokens;
  if (!tokens || Object.keys(tokens).length === 0) return '';
  const decls = Object.entries(tokens)
    .filter(([key]) => /^--[a-z0-9-]+$/i.test(key))
    .map(([key, value]) => `  ${key}: ${String(value)};`)
    .join('\n');
  return decls ? `:root {\n${decls}\n}\n` : '';
}
