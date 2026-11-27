import { useEffect, useState } from 'preact/hooks';
import { darkScheme } from '@maggioli-design-system/design-tokens/src/formats/dark-scheme';

/*
  Whether the document of the studio is in the dark mode of Magma, the one its palette turns dark
  in. The sheets of the studio are plain CSS, with no `dark:` variant: what has to change with the
  mode beyond the roles (the mark of the bar, app/shell.tsx) reads the list the dark palette and the
  `dark:` variant of Magma are printed from (design-tokens, src/formats/dark-scheme.ts), so it
  flips exactly when the roles do: the mode of the person (mds-pref-mode in the menu: light, dark,
  system), the scheme a theme is locked to, and the mode of the OS.
*/

const FORCED = darkScheme.forced.join(', ');
const SYSTEM = darkScheme.system.join(', ');

/** The media query of the dark OS; none where there is no matchMedia (jsdom): the OS counts as light. */
const darkOs = () => (typeof matchMedia === 'function' ? matchMedia(darkScheme.media) : undefined);

/** Whether `root`, the <html> of a document, is in the dark mode of Magma. */
export function isDark(root: Element = document.documentElement): boolean {
  return root.matches(FORCED) || (Boolean(darkOs()?.matches) && root.matches(SYSTEM));
}

/** isDark of the document of the studio, again when the classes of its <html> or the OS mode change. */
export function useDarkMode(): boolean {
  const [dark, setDark] = useState(() => isDark());
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(isDark(root));
    // mds-pref-mode writes the mode on <html>, mds-pref marks it as the controller
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-magma-pref'] });
    const media = darkOs();
    media?.addEventListener('change', update);
    // a change between the render and the effect
    update();
    return () => {
      observer.disconnect();
      media?.removeEventListener('change', update);
    };
  }, []);
  return dark;
}
