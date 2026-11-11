/**
 * Renders one story with the palette of the page in dark, as mds-pref-mode sets it: the class of
 * the mode on <html>, which the palette follows and the components read through the preference
 * store. Use it as the `beforeEach` of a story: the cleanup it returns restores the classes the
 * preview had, so the next story renders in its own mode.
 */
export const inDarkMode = (): (() => void) => {
  const { classList } = document.documentElement;
  const modes = ['pref-mode-light', 'pref-mode-system', 'pref-mode-dark'].filter((mode) =>
    classList.contains(mode),
  );
  classList.remove(...modes);
  classList.add('pref-mode-dark');
  return () => {
    classList.remove('pref-mode-dark');
    classList.add(...modes);
  };
};
