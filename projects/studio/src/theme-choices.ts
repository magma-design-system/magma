import { useEffect, useRef, useState } from 'preact/hooks';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';

/*
  The choices a person makes on the Themes page, per family: the name of the theme, the variant
  each accent role points at, the colour modes it is used in. Only the changes are kept: what is
  missing is the theme Magma ships from the family, then the base (themes.tsx). They belong to the
  studio, not to one page: the Theme section shows the theme as the Themes page defines it, a
  theme of one mode in that mode only (shell.tsx). They are kept in the storage of the studio
  beside the draft, so a reload keeps them, until the configuration keeps the themes itself
  (#694, the theme files of a project).
*/

export interface ThemeChoices {
  /** family -> the name given to its theme */
  names: Record<string, string>;
  /** family -> accent role -> the variant family it points at */
  accents: Record<string, Record<string, string>>;
  /** family -> the colour modes of its theme */
  modes: Record<string, readonly ColorMode[]>;
}

export const THEME_CHOICES_KEY = 'magma-studio:theme-choices';

/** No choice: every theme as Magma ships it, or as its family. */
export const NO_THEME_CHOICES: ThemeChoices = { names: {}, accents: {}, modes: {} };

const read = (): ThemeChoices => {
  try {
    const stored = JSON.parse(localStorage.getItem(THEME_CHOICES_KEY) ?? 'null');
    return stored && typeof stored === 'object'
      ? { ...NO_THEME_CHOICES, ...stored }
      : NO_THEME_CHOICES;
  } catch {
    return NO_THEME_CHOICES;
  }
};

let current: ThemeChoices = read();
const listeners = new Set<() => void>();

/** The choices now, outside a component. */
export const themeChoices = (): ThemeChoices => current;

/** Changes the choices, stores them and redraws every component that reads them. */
export function updateThemeChoices(update: (previous: ThemeChoices) => ThemeChoices): void {
  current = update(current);
  try {
    localStorage.setItem(THEME_CHOICES_KEY, JSON.stringify(current));
  } catch {
    /* storage blocked: the choices last until the page is left */
  }
  listeners.forEach((listener) => listener());
}

/** Forgets every choice: Reset of the studio, and the tests. */
export function resetThemeChoices(): void {
  updateThemeChoices(() => NO_THEME_CHOICES);
}

/**
 * The choices, kept current in the component that reads them. It listens from its first render,
 * not from an effect: Preact runs effects after paint, and a change made in between (the name
 * typed right after the page opens) would not redraw it.
 */
export function useThemeChoices(): ThemeChoices {
  const [, redraw] = useState(0);
  const listener = useRef<(() => void) | null>(null);
  if (!listener.current) {
    listener.current = () => redraw((count) => count + 1);
    listeners.add(listener.current);
  }
  useEffect(
    () => () => {
      if (listener.current) listeners.delete(listener.current);
    },
    [],
  );
  return current;
}
