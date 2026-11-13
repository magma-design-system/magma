/**
 * The hook a client-side router registers, once, to take over the links of the components
 * (`href` of `mds-button`, `mds-tab-item`, ...). The component calls it on a plain click: left
 * button, no modifier, same origin, no `target="blank"`; by then it has cancelled the navigation
 * of the browser with `preventDefault()`. A modifier or middle click, the context menu, a link
 * to another origin and a link that downloads its file (`download`) never reach it: they stay
 * with the browser.
 *
 * Return `false` to decline a link: the component then follows it itself, loading the page.
 */
export type NavigationHandler = (href: string, event: MouseEvent) => boolean | void;

/**
 * The `download` attribute of the anchor of a component link, from its `download` prop, read as
 * the attribute of `<a>` (HTML, "Downloading resources"): `true`, or the attribute with no value
 * (`''`), saves the file under the name the server gives it; any other string names the saved
 * file, `"false"` included, as on a native anchor. `false`, `null` and `undefined` leave the
 * anchor a plain link. The prop is `boolean | string` so that a framework binding `true`, as JSX
 * does for an attribute with no value, saves the file instead of naming it "true".
 */
export const downloadAttribute = (download?: boolean | string | null): string | undefined => {
  if (download === true) return '';
  return typeof download === 'string' ? download : undefined;
};

// Shared, cross-realm slot for the registered handler. Stencil emits several bundled copies of
// this module (lazy chunks, dist/components, the public `services` entry); `Symbol.for` returns
// the same symbol in every copy, so storing the handler under it on `globalThis` gives them all
// one source of truth, whichever copy the consumer registered it through.
const HANDLER_GLOBAL = Symbol.for('@maggioli-design-system/magma:navigationHandler');

type HandlerSlot = Record<symbol, NavigationHandler | undefined>;

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;

const isSameOrigin = (href: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(href, document.baseURI).origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * The one router hook of the page, exported from the package root as `NavigationService`.
 * Products call `setHandler()`, tagged `@public` and so listed in magma.api.txt; the other
 * members serve the components and may change in any release.
 */
class NavigationController {
  private get handler(): NavigationHandler | undefined {
    if (typeof globalThis === 'undefined') return undefined;
    return (globalThis as unknown as HandlerSlot)[HANDLER_GLOBAL];
  }

  private set handler(value: NavigationHandler | undefined) {
    if (typeof globalThis === 'undefined') return;
    (globalThis as unknown as HandlerSlot)[HANDLER_GLOBAL] = value;
  }

  /**
   * Registers the handler of the app, replacing the previous one; `undefined` removes it.
   * Returns the function that removes this handler, for the cleanup of an effect.
   *
   * @public
   */
  setHandler(handler?: NavigationHandler): () => void {
    this.handler = handler;
    return () => {
      if (this.handler === handler) this.handler = undefined;
    };
  }

  getHandler(): NavigationHandler | undefined {
    return this.handler;
  }

  /**
   * Whether the registered handler is to take this click on this link: there is one, the click
   * is a plain one and the link stays on the origin of the page.
   */
  canHandle(href: string, event: MouseEvent): boolean {
    return this.handler !== undefined && isPlainClick(event) && isSameOrigin(href);
  }

  /**
   * Hands the link to the registered handler. `true` when it took it; `false` when there is
   * none or it declined, and the caller follows the link itself.
   */
  handle(href: string, event: MouseEvent): boolean {
    const handler = this.handler;
    if (handler === undefined) return false;
    return handler(href, event) !== false;
  }
}

export const NavigationService = new NavigationController();
