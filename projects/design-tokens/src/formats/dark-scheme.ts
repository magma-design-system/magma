/**
 * Where the palette turns dark: the one list every sheet that flips with it prints, so they
 * cannot drift apart. The css-vars templates write the dark palette on it, the styles build
 * the dark block of the semantic layer (scripts/semantic.ts) and the Tailwind `dark:`
 * variant (scripts/dark-variant.ts).
 *
 * `mode` is light / dark / system, `theme` the named theme (#702). A theme that exists in
 * one scheme only (`pref-theme-scheme-light` / `-dark`) wins over the mode.
 */
export const darkScheme = {
  /** Dark whatever the OS: the dark mode unless the theme is light only, a theme dark only. */
  forced: [':root:not(.pref-theme-scheme-light).pref-mode-dark', ':root.pref-theme-scheme-dark'],
  /** Dark when the OS is (`media`): the system mode unless the theme is light only, a page with no mds-pref controller. */
  system: [':root:not(.pref-theme-scheme-light).pref-mode-system', ':root:not([data-magma-pref])'],
  media: '(prefers-color-scheme: dark)',
} as const;

/** The selector lists as the css-vars templates print them: one per line, `system` inside the media block. */
export const darkSchemeTemplateData = {
  forced: darkScheme.forced.join(',\n'),
  system: darkScheme.system.join(',\n  '),
  media: darkScheme.media,
};
