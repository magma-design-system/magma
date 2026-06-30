/**
 * Shared, reactive read-model of the `<html>` accessibility preferences
 * (theme / contrast / animation / consumption).
 *
 * The `mds-pref-*` controllers remain the sole writers/authority: they publish
 * the resolved state as a `pref-<dim>-<value>` class on `<html>` (and the
 * Storybook accessibility panel writes the same class). This store does NOT
 * decide anything - it mirrors that published state behind a SINGLE shared
 * MutationObserver, so consuming components subscribe to one central channel
 * instead of each one sniffing `<html>` on its own.
 *
 * Consumers bind the value to a dedicated host attribute and style off it with
 * plain `:host([pref-<dim>='...'])` selectors (no `:host-context`).
 */

type PreferenceListener = (value: string | undefined) => void;

// Allowed values per preference, mirroring the pref-<dim>-<value> classes the
// controllers publish. Single-axis only for now - theme is multi-axis (mode +
// scheme) and will need a dedicated resolver when it is converted.
const PREFERENCE_VALUES: Record<string, string[]> = {
  animation: ['reduce', 'system', 'no-preference'],
  consumption: ['low', 'medium', 'high'],
  contrast: ['more', 'no-preference', 'system'],
  // theme is two independent single-axis prefs: mode (mds-pref-theme) + scheme
  // (mds-pref-theme-variant). Resolved separately, both reflected on the host.
  theme: ['light', 'dark', 'system'],
  'theme-scheme': ['light', 'dark', 'all'],
};

const listeners = new Map<string, Set<PreferenceListener>>();
const current = new Map<string, string | undefined>();
let observer: MutationObserver | undefined;

const resolve = (preference: string): string | undefined => {
  const values = PREFERENCE_VALUES[preference] ?? [];
  const { classList } = document.documentElement;
  return values.find((value) => classList.contains(`pref-${preference}-${value}`));
};

const sync = (): void => {
  listeners.forEach((set, preference) => {
    const next = resolve(preference);
    if (next !== current.get(preference)) {
      current.set(preference, next);
      set.forEach((listener) => listener(next));
    }
  });
};

const ensureObserver = (): void => {
  if (observer) {
    return;
  }
  observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
};

/**
 * Subscribe to a preference. The listener is called immediately with the
 * current value (or `undefined` when no controller has published it) and again
 * on every change. Returns a teardown to call from `disconnectedCallback`.
 */
const subscribePreference = (preference: string, listener: PreferenceListener): (() => void) => {
  if (typeof document === 'undefined') {
    listener(undefined);
    return () => {};
  }

  ensureObserver();

  if (!listeners.has(preference)) {
    listeners.set(preference, new Set());
    current.set(preference, resolve(preference));
  }

  const set = listeners.get(preference);
  set?.add(listener);
  listener(current.get(preference));

  return () => {
    set?.delete(listener);
    if (set && set.size === 0) {
      listeners.delete(preference);
      current.delete(preference);
    }
  };
};

export { subscribePreference };
