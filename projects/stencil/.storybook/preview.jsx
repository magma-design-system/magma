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
} from './preferences.mjs';

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
  backgrounds: {
    options: {
      white: { name: 'White', value: 'rgb(255 255 255)' },
      light: { name: 'Light', value: 'rgb(var(--tone-neutral-10, 248 248 248))' },
      grey: { name: 'Grey', value: 'rgb(var(--tone-neutral-06, 162 162 162))' },
      dark: { name: 'Dark', value: 'rgb(var(--tone-neutral-01, 33 33 33))' },
      black: { name: 'Black', value: 'rgb(0 0 0)' },
    },
  },
};

const decorators = [
  (Story) => (
    <div className="p-600">
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
