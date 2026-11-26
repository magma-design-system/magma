/**
 * What the FOUC sheet of a component does (src/tailwind/fouc.css, imported through
 * css/<tag>-fouc.css): it hides the host until it carries the hydrated flag, and every mds-*
 * child it renders until that child does. Read here as a page sees them before hydration.
 */

/**
 * The opacity of the host once it has lost its hydrated flag. `not-hydrated` switches with a
 * 0.1s transition-delay, which a host on the default `transition-property: all` honours: the
 * value is read once those transitions are over.
 */
export const hostOpacityBeforeHydration = async (host: HTMLElement): Promise<string> => {
  host.removeAttribute('hydrated');
  await Promise.all(host.getAnimations().map((animation) => animation.finished));
  const { opacity } = getComputedStyle(host);
  host.setAttribute('hydrated', '');
  return opacity;
};

/**
 * The computed style of a host once the transitions its hydration started are over. Its sheet
 * reaches the host while `not-hydrated` still holds it, with the same 0.1s transition-delay: an
 * interpolable property (a padding, a colour) keeps the value it had without the sheet for that
 * delay, and `render` can return inside it (it did with Playwright 1.65.1 and @stencil/vitest
 * 1.16.2, #1413). A property that does not interpolate (display, a gap from `normal`) is not
 * held.
 */
export const settledStyle = async (host: HTMLElement): Promise<CSSStyleDeclaration> => {
  await Promise.all(host.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(host);
};

/**
 * The opacity of a fresh `tag` child put in the shadow root of the host. The child renders on a
 * later task, so read at once it has no sheet of its own yet: only the host's can hide it.
 */
export const childOpacityBeforeHydration = (host: HTMLElement, tag: string): string => {
  const child = host.shadowRoot!.appendChild(document.createElement(tag));
  const { opacity } = getComputedStyle(child);
  child.remove();
  return opacity;
};
