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
  set: 'magma/preferences/set',
  toggle: 'magma/preferences/toggle',
};

export const PREFS_ENABLED_KEY = 'mdsPrefStorybookPrefs';

export const UNSET = 'unset';

export const PREFERENCES = [
  {
    name: 'theme',
    label: 'Theme',
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
