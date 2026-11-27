import { render } from 'preact';
import { createRouter, hashLocation, memoryLocation } from './app/router.js';
import { Studio } from './app/shell.js';
import { startLanguage } from './shared/i18n/i18n.js';
import { isAddress, routeOf } from './shared/routes/routes.js';
import { createStudio, type StudioOptions } from './state/studio.js';
import { checkSource } from './state/work.js';

/*
  The one entry of the studio (#1404): every host mounts it on an element of its page with
  mount(element, options), and takes it off with what mount returns. The page of the studio
  (index.html, on GitHub Pages and in the command of a project) is a host like the others; the
  docs site and the command of #695 come with #1364. A host hands in what it owns: where the
  address lives (the hash of its window, or memory when the address of its page is its own), where
  the work is kept, whether a command stands beside the page.
*/

export interface MountOptions extends StudioOptions {
  /**
   * Where the address of the studio lives: the hash of the window (the default), or memory, for a
   * host that owns the address of its page (#695); the hashes of its page that are no address of
   * the studio (the anchors of Starlight) are left alone either way.
   */
  location?: 'hash' | 'memory';
  /** Where the studio opens in memory, as a link writes it (`#/themes`): the introduction else. */
  address?: string;
}

/** A studio mounted on an element. */
export interface Mounted {
  /** Takes the studio off its element: its page, its router, the effects of its state. */
  unmount(): void;
}

export function mount(element: Element, options: MountOptions = {}): Mounted {
  const { location = 'hash', address, ...kept } = options;
  const page = element.ownerDocument;
  // the language before the first render, and before mds-pref-language of the menu reads it
  startLanguage(page);
  const state = createStudio(kept);
  const router = createRouter({
    location: location === 'memory' ? memoryLocation(address) : hashLocation(page.defaultView!),
  });
  // the state the studio is handed is checked against its source by the one that made it
  void checkSource(state);
  // in memory, a link of the studio opens its page in memory: the hash of the window is the host's.
  // The link may be inside a component of Magma (the <a> of mds-button), so the path of the click
  // is read through the shadow roots
  const follow = (event: Event) => {
    const link = event
      .composedPath()
      .find((one): one is Element => one instanceof Element && one.hasAttribute('href'));
    const hash = link?.getAttribute('href') ?? '';
    const route = isAddress(hash) ? routeOf(hash) : undefined;
    if (!route) return;
    event.preventDefault();
    router.navigate(route);
  };
  if (location === 'memory') element.addEventListener('click', follow);
  render(<Studio state={state} router={router} />, element);
  return {
    unmount() {
      element.removeEventListener('click', follow);
      render(null, element);
      router.dispose();
      state.dispose();
    },
  };
}
