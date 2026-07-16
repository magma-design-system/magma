import type { DeckConfig } from '../model/types.js';

/** Theme used when a deck does not set one. */
export const DEFAULT_THEME = 'maggioli';

/** Whether a theme name selects the dark scheme (any `<name>-dark`). */
export function isDarkTheme(theme: string | undefined): boolean {
  return /-dark$/.test(theme ?? '');
}

/**
 * Base theme name without the scheme suffix, e.g. `maggioli-dark` -> `maggioli`.
 * This is the folder under theme/themes/ that holds the theme's CSS and assets.
 */
export function themeBase(theme: string | undefined): string {
  return (theme ?? DEFAULT_THEME).replace(/-dark$/, '') || DEFAULT_THEME;
}

/**
 * Map a deck theme name to the root class that drives Magma's light/dark flip.
 * A `-dark` theme forces dark, otherwise light. Both are deterministic;
 * following the OS scheme is left to a future `-system` theme.
 */
export function resolveThemeClass(theme: string | undefined): string {
  return isDarkTheme(theme) ? 'pref-theme-scheme-dark' : 'pref-theme-scheme-light';
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
