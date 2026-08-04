import { addons } from 'storybook/preview-api';

import { defineCustomElements } from '../dist/esm/loader';

import '@fontsource/karla/400.css';
import '@fontsource/karla/700.css';
import '@fontsource/merriweather/300.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import './styles.css';

import devices from './devices.json';
// import media from '@maggioli-design-system/design-tokens/dist/js/tailwind-screens'

import {
  LANGUAGE,
  PREF_CHANNEL_EVENTS,
  PREFERENCES,
  PREFS_ENABLED_KEY,
  UNSET,
  storageKey,
  storedValue,
} from './preferences';

defineCustomElements();

const pathName = window.location.pathname.replace('/iframe.html', '');
const svgPath =
  pathName.charAt(pathName.length - 1) === '/' ? `${pathName}svg/` : `${pathName}/svg/`;

window.sessionStorage.setItem('mdsIconSvgPath', svgPath);

/**
 * The preview is the only writer of the preview `<html>`: the manager panel
 * emits channel events and the handlers below publish the same contract the
 * mds-pref-* controllers use, so the preferenceStore syncs the components.
 */
const htmlEl = document.documentElement;

const clearPreference = ({ name, options }) => {
  options.forEach(({ value }) => htmlEl.classList.remove(`pref-${name}-${value}`));
  htmlEl.style.removeProperty(`--magma-pref-${name}`);
};

const applyPreference = (preference, value) => {
  clearPreference(preference);
  if (value === UNSET) {
    window.localStorage.removeItem(storageKey(preference.name));
    return;
  }
  htmlEl.classList.add(`pref-${preference.name}-${value}`);
  htmlEl.style.setProperty(`--magma-pref-${preference.name}`, value);
  window.localStorage.setItem(storageKey(preference.name), value);
};

const applyLanguage = (value) => {
  if (value === UNSET) {
    htmlEl.removeAttribute('lang');
    window.localStorage.removeItem(storageKey(LANGUAGE.name));
    return;
  }
  htmlEl.setAttribute('lang', value);
  window.localStorage.setItem(storageKey(LANGUAGE.name), value);
};

// Disabling only suspends the emulation: `<html>` is cleaned up but the
// stored choices are kept, so re-enabling restores them.
const applyStoredPreferences = (enabled) => {
  if (!enabled) {
    htmlEl.removeAttribute('data-magma-pref');
    htmlEl.removeAttribute('lang');
    PREFERENCES.forEach((preference) => clearPreference(preference));
    return;
  }
  htmlEl.setAttribute('data-magma-pref', '');
  PREFERENCES.forEach((preference) => applyPreference(preference, storedValue(preference)));
  applyLanguage(storedValue(LANGUAGE));
};

applyStoredPreferences(window.localStorage.getItem(PREFS_ENABLED_KEY) === 'enable');

const channel = addons.getChannel();

channel.on(PREF_CHANNEL_EVENTS.toggle, (enabled) => {
  window.localStorage.setItem(PREFS_ENABLED_KEY, enabled ? 'enable' : 'disable');
  applyStoredPreferences(enabled);
});

channel.on(PREF_CHANNEL_EVENTS.set, ({ name, value }) => {
  if (name === LANGUAGE.name) {
    applyLanguage(value);
    return;
  }
  const preference = PREFERENCES.find((item) => item.name === name);
  if (preference) {
    applyPreference(preference, value);
  }
});

const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
  viewport: {
    devices,
    // viewports,
  },
  // Storybook 9 reads `options`, keyed by id (the 7.x shape - a `values` array plus a
  // `default` name - is no longer read, which is why the previous entries did nothing).
  //
  // The entries are the five SURFACE ROLES, so the picker lets a component be judged on
  // each plane of the system and retints with the active theme. They read the public
  // `--magma-surface-*` roles, NOT the `--magma-tint-*` block those resolve through:
  // the tint block is the private seam a theme repoints (and where the contrast
  // promotions land), and no component sheet reads it - keep this consumer on the same
  // side of the contract as everything else.
  //
  // No default is set on purpose: with no background chosen the canvas comes from the
  // `body` rule in styles.css, which is token-driven too (`bg-surface-overlay` - pure
  // white in light, following the theme in dark). So the theme-aware neutral canvas is
  // the DEFAULT state and this picker is only the manual override.
  //
  // The fallbacks are what make the swatches render. Each value is used in TWO frames:
  // the preview, where the tokens exist and the var wins, so the applied background
  // follows the theme; and the MANAGER, which draws the swatch in the toolbar and never
  // loads the token CSS, so there the var resolves to nothing and only the fallback is
  // left. They are the LIGHT values of the neutral family and exist for the swatch only -
  // refresh them if the surface ramp is retuned (`--surface-neutral-*` in design-tokens).
  backgrounds: {
    options: {
      neutral: { name: 'Neutral', value: 'rgb(var(--tone-neutral-seed, 255 255 255))' },
      sunken: { name: 'Sunken', value: 'rgb(var(--magma-surface-sunken, 232 232 232))' },
      muted: { name: 'Muted', value: 'rgb(var(--magma-surface-muted, 235 235 235))' },
      default: { name: 'Default', value: 'rgb(var(--magma-surface-default, 242 242 242))' },
      raised: { name: 'Raised', value: 'rgb(var(--magma-surface-raised, 248 248 248))' },
      overlay: { name: 'Overlay', value: 'rgb(var(--magma-surface-overlay, 255 255 255))' },
    },
  },
};

const decorators = [
  (Story) => (
    <div className="p-lg">
      <Story />
    </div>
  ),
];

const preview = {
  parameters,
  decorators,
  tags: ['autodocs'],
};

export default preview;
