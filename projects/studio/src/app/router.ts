import { signal, type ReadonlySignal } from '@preact/signals';
import { HOME, hrefOf, isAddress, routeOf, type Route } from '../shared/routes/routes.js';

/*
  The router of the studio (#1400): it follows a location, the hash of the window or one in memory
  (the tests, a host that owns the address of its page, #695), and opens the page its address
  names. The pages and their addresses are a table under the pages and the bar
  (shared/routes/routes.ts, #1401), so a page links another without importing app/. A hash that
  does not start with `#/` is no address of the studio but the anchor of a heading of the page that
  hosts it (Starlight): it is left alone.
*/

/** Where the address of the studio is kept: the hash of a window, or memory. */
export interface Location {
  /** The hash now, `#/colors/palette`; '' with none. */
  read(): string;
  /** Writes a hash: a new entry of the history, or in place of the one shown (`replace`). */
  write(hash: string, replace: boolean): void;
  /**
   * Calls back when the hash changes from outside the router (back, forward, a link followed, a
   * hash typed); returns what stops it.
   */
  listen(change: () => void): () => void;
}

/** The hash of a window: a link of the page and the history of the browser move it too. */
export function hashLocation(win: Window = window): Location {
  return {
    read: () => win.location.hash,
    write: (hash, replace) => {
      if (replace) win.history.replaceState(win.history.state, '', hash);
      else win.location.hash = hash;
    },
    listen: (change) => {
      win.addEventListener('hashchange', change);
      return () => win.removeEventListener('hashchange', change);
    },
  };
}

/** A location in memory: its history, and a way to move it from outside, as a link would. */
export interface MemoryLocation extends Location {
  /** The hashes of the history, the last one shown. */
  readonly entries: readonly string[];
  /** Follows a hash from outside the router: a link, a hash typed. */
  go(hash: string): void;
}

/** A location of its own, for a test or a host that owns the address of its page (#695). */
export function memoryLocation(initial = ''): MemoryLocation {
  const entries = [initial];
  const listeners = new Set<() => void>();
  return {
    entries,
    read: () => entries[entries.length - 1],
    write: (hash, replace) => {
      if (replace) entries[entries.length - 1] = hash;
      else entries.push(hash);
    },
    listen: (change) => {
      listeners.add(change);
      return () => listeners.delete(change);
    },
    go: (hash) => {
      entries.push(hash);
      listeners.forEach((change) => change());
    },
  };
}

export interface Router {
  /** The page shown. */
  route: ReadonlySignal<Route>;
  /**
   * Opens a page, as following its link does; `replace` writes its address in place of the one
   * shown, for a choice made on the page that is no page to go back to (the theme and the mode of
   * the Theme section).
   */
  navigate(route: Route, options?: { replace?: boolean }): void;
  /** Stops following the location. */
  dispose(): void;
}

/**
 * A router on a location. An address that names a page opens it, an alias writing the address of
 * its page in place; an empty one, or one of the studio that names no page, opens `fallback` and
 * writes its address in place; a hash that is no address of the studio (an anchor) is left alone,
 * the page shown kept.
 */
export function createRouter({
  location = hashLocation(),
  fallback = HOME,
}: { location?: Location; fallback?: Route } = {}): Router {
  const route = signal<Route>(routeOf(location.read()) ?? fallback);
  const show = (next: Route) => {
    if (hrefOf(next) !== hrefOf(route.peek())) route.value = next;
  };
  const follow = () => {
    const hash = location.read();
    if (hash !== '' && hash !== '#' && !isAddress(hash)) return;
    const next = routeOf(hash);
    if (next) {
      // an alias (#/start) opens its page, whose address takes its place
      if (hash !== '' && hrefOf(next) !== hash) location.write(hrefOf(next), true);
      show(next);
    } else {
      location.write(hrefOf(fallback), true);
      show(fallback);
    }
  };
  follow();
  const stop = location.listen(follow);
  return {
    route,
    navigate: (next, { replace = false } = {}) => {
      const hash = hrefOf(next);
      if (hash !== location.read()) location.write(hash, replace);
      show(next);
    },
    dispose: stop,
  };
}
