import { afterEach, beforeEach } from 'vitest';

/**
 * Renders the tests of the calling `describe` in `language`: the components read it from the
 * `lang` of `<html>`, through the preference store, and the one the page had comes back after
 * each test, so the next file does not inherit it.
 */
export const useLanguage = (language: string): void => {
  let previous = '';

  beforeEach(() => {
    previous = document.documentElement.lang;
    document.documentElement.lang = language;
  });

  afterEach(() => {
    document.documentElement.lang = previous;
  });
};
