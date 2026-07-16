import { createStore } from '@stencil/store';

/**
 * Shared, reactive read-model of the `<html>` UI preferences
 * (theme / contrast / animation / consumption / language).
 *
 * The `mds-pref-*` controllers remain the sole internal writers/authority: they
 * publish the resolved state as `pref-<dim>-<value>` classes on `<html>` (the
 * global theming contract consumed by the styles package tokens and the
 * Storybook accessibility panel) plus the standard `lang` attribute for the
 * language, and mirror the same values into the store. The MutationObservers
 * below keep the store in sync when external writers touch `<html>` directly.
 *
 * Consumers read `preferenceStore.state.<dim>` during render: the read
 * auto-subscribes the component (@stencil/store), which re-renders it on
 * change. Style off dedicated host attributes with plain
 * `:host([pref-<dim>='...'])` selectors (no `:host-context`).
 */

type PreferenceName = 'animation' | 'consumption' | 'contrast' | 'theme' | 'theme-scheme';

type PreferenceState = Partial<Record<PreferenceName, string>> & { language: string };

// Allowed values per preference, mirroring the pref-<dim>-<value> classes the
// controllers publish. Single-axis only for now - theme is multi-axis (mode +
// scheme) and will need a dedicated resolver when it is converted.
const PREFERENCE_VALUES: Record<PreferenceName, string[]> = {
  animation: ['reduce', 'system', 'no-preference'],
  consumption: ['low', 'medium', 'high'],
  contrast: ['more', 'no-preference', 'system'],
  // theme is two independent single-axis prefs: mode (mds-pref-theme) + scheme
  // (mds-pref-theme-variant). Resolved separately, both reflected on the host.
  theme: ['light', 'dark', 'system'],
  'theme-scheme': ['light', 'dark', 'all'],
};

const preferenceStore = createStore<PreferenceState>({ language: 'en' });

const resolve = (preference: PreferenceName): string | undefined => {
  const values = PREFERENCE_VALUES[preference];
  const { classList } = document.documentElement;
  return values.find((value) => classList.contains(`pref-${preference}-${value}`));
};

// The store skips no-op assignments, so redundant syncs don't re-render consumers.
const syncPreferences = (): void => {
  (Object.keys(PREFERENCE_VALUES) as PreferenceName[]).forEach((preference) => {
    preferenceStore.state[preference] = resolve(preference);
  });
};

const syncLanguage = (): void => {
  preferenceStore.state.language = document.documentElement.lang || 'en';
};

if (typeof document !== 'undefined') {
  syncPreferences();
  syncLanguage();
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(syncPreferences).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    new MutationObserver(syncLanguage).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }
}

export { preferenceStore };
