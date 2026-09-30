import React, { useEffect, useState } from 'react';
import { DocsContainer } from '@storybook/addon-docs/blocks';
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

import { themes } from './theme.mjs';
import {
  CHROME_MODE,
  DARK_QUERY,
  LANGUAGE,
  PREF_CHANNEL_EVENTS,
  PREFERENCES,
  PREFS_ENABLED_KEY,
  UNSET,
  effectiveScheme,
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
// stored choices are kept, so re-enabling restores them. The preview is then
// pinned to CHROME_MODE instead of left unmanaged: with no controller the palette
// and `color-scheme` would follow the OS behind the back of the chrome, which only
// repaints on the scheme the preview publishes. Mode: System covers the OS path.
const applyStoredPreferences = (enabled) => {
  if (!enabled) {
    htmlEl.removeAttribute('lang');
    PREFERENCES.forEach((preference) => clearPreference(preference));
    htmlEl.setAttribute('data-magma-pref', '');
    htmlEl.classList.add(`pref-mode-${CHROME_MODE}`);
    htmlEl.style.setProperty('--magma-pref-mode', CHROME_MODE);
    return;
  }
  htmlEl.setAttribute('data-magma-pref', '');
  PREFERENCES.forEach((preference) => applyPreference(preference, storedValue(preference)));
  applyLanguage(storedValue(LANGUAGE));
};

const channel = addons.getChannel();

// The chrome is painted in the scheme the preview renders: every change of the
// mode, of the panel toggle or of the OS scheme is published to the manager
// (channel) and to the docs container (local listeners).
const schemeListeners = new Set();
const publishScheme = () => {
  const scheme = effectiveScheme();
  channel.emit(PREF_CHANNEL_EVENTS.scheme, scheme);
  schemeListeners.forEach((listener) => listener(scheme));
};

applyStoredPreferences(window.localStorage.getItem(PREFS_ENABLED_KEY) === 'enable');
publishScheme();
window.matchMedia(DARK_QUERY).addEventListener('change', publishScheme);

channel.on(PREF_CHANNEL_EVENTS.toggle, (enabled) => {
  window.localStorage.setItem(PREFS_ENABLED_KEY, enabled ? 'enable' : 'disable');
  applyStoredPreferences(enabled);
  publishScheme();
});

channel.on(PREF_CHANNEL_EVENTS.set, ({ name, value }) => {
  if (name === LANGUAGE.name) {
    applyLanguage(value);
    return;
  }
  const preference = PREFERENCES.find((item) => item.name === name);
  if (preference) {
    applyPreference(preference, value);
    publishScheme();
  }
});

const ThemedDocsContainer = ({ children, context }) => {
  const [scheme, setScheme] = useState(effectiveScheme);

  useEffect(() => {
    schemeListeners.add(setScheme);
    return () => schemeListeners.delete(setScheme);
  }, []);

  return (
    <DocsContainer context={context} theme={themes[scheme]}>
      {children}
    </DocsContainer>
  );
};

const parameters = {
  a11y: {
    test: 'error',
    config: {
      rules: [
        // the colours come from @maggioli-design-system/design-tokens: a contrast below the
        // threshold is a token decision, reported in the "needs review" list instead of failing
        { id: 'color-contrast', reviewOnFail: true },
      ],
    },
  },
  docs: {
    container: ThemedDocsContainer,
  },
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

// The a11y addon runs axe in its own afterEach: ours runs first (afterEach hooks
// are called in reverse order) so axe never inspects a component that Stencil has
// not finished hydrating, which otherwise reports the slotted label as missing.
const HYDRATION_TIMEOUT = 3000;
const pendingHydration = () =>
  Array.from(document.querySelectorAll('*')).filter(
    (element) => element.tagName.startsWith('MDS-') && !element.hasAttribute('hydrated'),
  ).length;
const afterEach = async () => {
  const deadline = Date.now() + HYDRATION_TIMEOUT;
  while (pendingHydration() > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

const preview = {
  afterEach,
  parameters,
  decorators,
  tags: ['autodocs'],
};

export default preview;
