import { useEffect, useRef, useState } from 'preact/hooks';
import { NO_THEME_CHOICES, type ThemeChoices } from './engine/theme-choices.js';

// The store of the theme choices: kept in the storage of the studio and redrawn where read. The
// choices themselves, and what no choice means, are the model of engine/theme-choices.ts.

export const THEME_CHOICES_KEY = 'magma-studio:theme-choices';

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
