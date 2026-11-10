import { createStore } from '@stencil/store';

/**
 * Shared, reactive read-model of the `<html>` UI preferences
 * (mode / theme scheme / contrast / animation / consumption / language).
 *
 * The `mds-pref-*` controllers remain the sole internal writers/authority: they
 * publish the resolved state as `pref-<dim>-<value>` classes on `<html>` (the
 * global theming contract consumed by the styles package tokens and the
 * Storybook accessibility menu) plus the standard `lang` attribute for the
 * language, and mirror the same values into the store. The MutationObservers
 * below keep the store in sync when external writers touch `<html>` directly.
 *
 * Consumers read `preferenceStore.state.<dim>` during render: the read
 * auto-subscribes the component (@stencil/store), which re-renders it on
 * change. Style off dedicated host attributes with plain
 * `:host([pref-<dim>='...'])` selectors (no `:host-context`).
 */

type PreferenceName = 'animation' | 'consumption' | 'contrast' | 'mode' | 'theme-scheme';

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
// controllers publish.
const PREFERENCE_VALUES: Record<PreferenceName, string[]> = {
  animation: ['reduce', 'system', 'no-preference'],
  consumption: ['low', 'medium', 'high'],
  contrast: ['more', 'no-preference', 'system'],
  // Two independent axes: the mode (light / dark / system, mds-pref-mode) and the
  // scheme the named theme allows (mds-pref-theme). Both reflected on the host.
  mode: ['light', 'dark', 'system'],
  'theme-scheme': ['light', 'dark', 'all'],
};

const preferenceStore = createStore<PreferenceState>({ language: 'en' });

const MODE_VALUES = PREFERENCE_VALUES.mode;

/**
 * Where the block of a named theme says the one colour mode it can be used in (#1274):
 * `COLOR_MODES_PROPERTY` of design-tokens/semantic.model.ts, which prints it into `themes.css`
 * (projects/styles/SEMANTIC_COLOR_SPEC.md, section 8). A theme for both modes declares nothing.
 */
const COLOR_MODES_PROPERTY = '--magma-color-modes';

/**
 * The scheme a theme's declared modes lock it to: `light` or `dark` when the value names that one
 * mode, nothing when it names both, none, or a mode the format does not have (it lists the values
 * of `color-scheme`, `light` and `dark`).
 */
const lockedSchemeOf = (modes: string): 'light' | 'dark' | undefined => {
  const listed = modes.trim().split(/\s+/).filter(Boolean);
  if (listed.length !== 1) return undefined;
  const [mode] = listed;
  return mode === 'light' || mode === 'dark' ? mode : undefined;
};

/**
 * Carry the v1 storage keys over to the v2 ones, and the magma 2 theme
 * `default` over to `business`, once, before any controller reads them.
 *
 * v1 called the mode `mdsPrefTheme` and the named theme `mdsPrefThemeName`; v2
 * calls them `mdsPrefMode` and `mdsPrefTheme`. The key `mdsPrefTheme` exists in
 * both with a different meaning, so it has to be moved before `mds-pref-theme`
 * reads it: a v1 `dark` read as a theme name would be applied as a theme, and
 * the v1 mode would be lost. A mode value cannot be a theme name
 * (`mds-pref-theme` rejects the three), which is what tells the two apart. It
 * runs here, at module load, because the controllers load in no fixed order.
 */
const migrateLegacyPreferenceStorage = (storage: Storage): void => {
  const legacyMode = storage.getItem('mdsPrefTheme');
  if (legacyMode !== null && MODE_VALUES.includes(legacyMode)) {
    if (storage.getItem('mdsPrefMode') === null) {
      storage.setItem('mdsPrefMode', legacyMode);
    }
    storage.removeItem('mdsPrefTheme');
  }
  const legacyTheme = storage.getItem('mdsPrefThemeName');
  if (legacyTheme !== null) {
    if (storage.getItem('mdsPrefTheme') === null) {
      storage.setItem('mdsPrefTheme', legacyTheme);
    }
    storage.removeItem('mdsPrefThemeName');
  }
  // magma 3 removed `default`, the old name of `business` that a magma 2 page stored as the
  // theme (#1334): the person's choice stays the base theme. `cool` and `warm` are left as they
  // are, a product may name a theme of its own so.
  if (storage.getItem('mdsPrefTheme') === 'default') storage.setItem('mdsPrefTheme', 'business');
};

if (typeof localStorage !== 'undefined') {
  try {
    migrateLegacyPreferenceStorage(localStorage);
  } catch {
    // Storage blocked (private mode, sandboxed frame): nothing to migrate.
  }
}

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

/**
 * Whether motion should be held back right now: the explicit `reduce` choice, or the OS
 * preference when the choice is `system` and when no controller has published one at all.
 *
 * The stylesheets read the same three cases through `:host([pref-animation])`, but a
 * stylesheet can only hold back what CSS drives. An animation written in JS - a GSAP
 * timeline, a rAF loop, a tween of an attribute - has to ask for itself, and until it does
 * the preference is only half kept.
 */
const prefersReducedMotion = (): boolean => {
  const choice = preferenceStore.state.animation;
  if (choice === 'reduce') {
    return true;
  }
  if (choice === 'no-preference') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

export {
  COLOR_MODES_PROPERTY,
  MODE_VALUES,
  lockedSchemeOf,
  migrateLegacyPreferenceStorage,
  preferenceStore,
  prefersReducedMotion,
};
