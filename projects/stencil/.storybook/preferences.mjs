/**
 * Shared contract between the Storybook manager (accessibility panel UI) and
 * the preview (the only writer of `<html>`): preference catalogue, channel
 * event names and localStorage keys.
 *
 * The preview applies each preference with the same contract as the
 * mds-pref-* controllers: a `pref-<name>-<value>` class plus the
 * `--magma-pref-<name>` custom property on `<html>` (the `lang` attribute for
 * the language), persisted in the same `mdsPref<Name>` localStorage keys so
 * controller stories and the panel stay in sync. The preferenceStore in
 * src/common/preference.ts picks the changes up through its MutationObservers.
 */

export const PREF_CHANNEL_EVENTS = {
  scheme: 'magma/preferences/scheme',
  set: 'magma/preferences/set',
  toggle: 'magma/preferences/toggle',
};

export const PREFS_ENABLED_KEY = 'mdsPrefStorybookPrefs';

export const UNSET = 'unset';

export const PREFERENCES = [
  {
    name: 'mode',
    label: 'Mode',
    fallback: 'light',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'system', label: 'System' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  {
    name: 'contrast',
    label: 'Contrast',
    fallback: 'no-preference',
    options: [
      { value: 'more', label: 'More' },
      { value: 'system', label: 'System' },
      { value: 'no-preference', label: 'No preference' },
      { value: UNSET, label: 'Unset' },
    ],
  },
  {
    name: 'animation',
    label: 'Animations',
    fallback: 'no-preference',
    options: [
      { value: 'reduce', label: 'Reduce' },
      { value: 'system', label: 'System' },
      { value: 'no-preference', label: 'No preference' },
      { value: UNSET, label: 'Unset' },
    ],
  },
  {
    name: 'consumption',
    label: 'Consumption',
    fallback: 'high',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: UNSET, label: 'Unset' },
    ],
  },
];

export const LANGUAGE = {
  name: 'language',
  label: 'Language',
  fallback: 'en',
  options: [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' },
    { value: 'el', label: 'Ελληνικά (Greek)' },
    { value: UNSET, label: 'Unset' },
  ],
};

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const storageKey = (name) => `mdsPref${capitalize(name)}`;

export const storedValue = ({ name, fallback }) =>
  window.localStorage.getItem(storageKey(name)) ?? fallback;

// The mode the preview is pinned to while the panel is disabled.
export const CHROME_MODE = 'light';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

const MODE = PREFERENCES.find(({ name }) => name === 'mode');

/**
 * The scheme the preview actually renders, so the Storybook chrome (manager
 * and docs theme) can be painted in the same one: the pinned chrome mode while
 * the panel is disabled, otherwise the stored mode, with `system` resolved
 * against the OS. Manager and preview share the origin, so both read the same
 * keys; after startup the preview publishes it on `PREF_CHANNEL_EVENTS.scheme`.
 */
export const effectiveScheme = () => {
  const enabled = window.localStorage.getItem(PREFS_ENABLED_KEY) === 'enable';
  const mode = enabled ? storedValue(MODE) : CHROME_MODE;
  if (mode === 'system') {
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  }
  return mode;
};
