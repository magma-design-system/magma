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

/**
 * The corner axis is the one dimension published as an ATTRIBUTE rather than a
 * class: the shape is cosmetic rather than an accessibility preference, and it
 * has to be able to deviate on any subtree, which `data-corner-shape` does and a
 * `pref-*` class on `<html>` does not. `undefined` means no deviation, i.e. the
 * shape the stylesheet ships (see projects/styles/scripts/corner.ts).
 */
type AttributePreferenceName = 'corner-shape';

type PreferenceState = Partial<Record<PreferenceName | AttributePreferenceName, string>> & {
  language: string;
};

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

const resolveCornerShape = (): string | undefined =>
  document.documentElement.getAttribute('data-corner-shape') ?? undefined;

// The store skips no-op assignments, so redundant syncs don't re-render consumers.
const syncPreferences = (): void => {
  (Object.keys(PREFERENCE_VALUES) as PreferenceName[]).forEach((preference) => {
    preferenceStore.state[preference] = resolve(preference);
  });
  preferenceStore.state['corner-shape'] = resolveCornerShape();
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
      attributeFilter: ['class', 'data-corner-shape'],
    });
    new MutationObserver(syncLanguage).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }
}

export { preferenceStore };
