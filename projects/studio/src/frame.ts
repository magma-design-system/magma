import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';

/*
  How the studio sets a theme on a page of its own (an iframe): the scene and the groups of the
  Theme section (shell.tsx), the preview beside the Palette (palette-side.tsx). The page is a
  document of its own, so what is set on its <html> moves it and leaves the studio alone (#695,
  "The dogfooding constraint").
*/

export type Scheme = 'light' | 'dark';

const PREF_CLASSES = [
  'pref-mode-light',
  'pref-mode-dark',
  'pref-mode-system',
  'pref-contrast-more',
  'pref-contrast-no-preference',
  'pref-contrast-system',
  'pref-theme-scheme-light',
  'pref-theme-scheme-dark',
  'pref-theme-scheme-all',
];

/**
 * Sets on the document of a frame what the author checks the theme under: the theme, the mode
 * and the contrast, written as the preferences of Magma write them on <html> (`data-magma-pref`,
 * `pref-mode-*`, `pref-contrast-*`, mds-pref-mode and mds-pref-contrast), so the frame follows
 * them and neither the system nor the choice the person stored. The scene has no mode nor
 * contrast of its own (scene.html): two frames side by side share the storage of the origin, and
 * a stored mode would bring both to the same one.
 */
export function applyFrame(
  scene: Document,
  {
    theme,
    scheme,
    contrast,
    css,
    modes = COLOR_MODES,
  }: {
    theme: string;
    scheme: Scheme;
    contrast: boolean;
    css?: string;
    /** The colour modes of the theme: one of them is its lock, as mds-pref-theme writes it. */
    modes?: readonly Scheme[];
  },
) {
  const html = scene.documentElement;
  html.setAttribute('data-theme-name', theme);
  html.setAttribute('data-magma-pref', '');
  html.classList.remove(...PREF_CLASSES);
  html.classList.add(
    `pref-mode-${scheme}`,
    contrast ? 'pref-contrast-more' : 'pref-contrast-no-preference',
    `pref-theme-scheme-${modes.length === 1 ? modes[0] : 'all'}`,
  );
  // the palette and the themes of the configuration (scene-css.ts), over the stylesheets of the
  // installed Magma: an unlayered rule wins over their layers, whatever their order
  let style = scene.getElementById(CONFIGURATION_STYLE) as HTMLStyleElement | null;
  if (css === undefined) {
    style?.remove();
    return;
  }
  if (!style) {
    style = scene.createElement('style');
    style.id = CONFIGURATION_STYLE;
    scene.head.append(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

const CONFIGURATION_STYLE = 'studio-configuration';
