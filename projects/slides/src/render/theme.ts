import type { DeckConfig } from '../model/types.js';

/**
 * Map a deck theme name to the root class that drives Magma's light/dark flip.
 * `maggioli` renders light, `maggioli-dark` forces dark. Both are deterministic;
 * following the OS scheme is left to a future `-system` theme.
 */
export function resolveThemeClass(theme: string | undefined): string {
  return theme === 'maggioli-dark' ? 'pref-theme-scheme-dark' : 'pref-theme-scheme-light';
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
