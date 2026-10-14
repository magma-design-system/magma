import { render } from '@stencil/vitest';
import base from '../../../styles/dist/css/base.css?raw';
import hydrated from '../../../styles/dist/css/hydrated.css?raw';
import preflight from 'tailwindcss/preflight.css?raw';

/**
 * Tailwind's preflight zeroes the margin, padding and border of every element. It is page CSS,
 * and page CSS beats the `:host` rules of a component whatever its layer, so the styles have to
 * hand the box back to the hydrated components. With the documented imports that only works
 * from `base` itself: base.css lands in a sublayer, and a sublayer loses to the preflight.
 */
describe('the box of a hydrated component under a page reset', () => {
  const urls: string[] = [];
  let sheet: HTMLStyleElement | undefined;

  /** An `@import` of the stylesheet into the layer, as the styles README documents it. */
  const importInto = (layer: string, css: string): string => {
    const url = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
    urls.push(url);
    return `@import url('${url}') layer(${layer});`;
  };

  /** The documented Magma imports, then what `@import 'tailwindcss'` brings: its preflight in `base`. */
  const loadPageStyles = async (): Promise<void> => {
    sheet = document.createElement('style');
    sheet.textContent = [
      '@layer reset, vendor, theme, base, components, utilities, overrides;',
      importInto('base', hydrated),
      importInto('base', base),
      importInto('base', preflight),
    ].join('\n');
    const loaded = new Promise((resolve) => sheet!.addEventListener('load', resolve));
    document.head.append(sheet);
    await loaded;
  };

  afterEach(() => {
    sheet?.remove();
    urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  });

  it('keeps the :host padding of a component flagged with the attribute', async () => {
    // the browser builds (loader, dist/components) flag the host with the attribute only, and
    // the rule matched the class
    const { root } = await render('<mds-banner headline="Banner"></mds-banner>');
    const padding = getComputedStyle(root).padding;

    await loadPageStyles();

    expect(root).toHaveAttribute('hydrated');
    expect(padding).not.toBe('0px');
    expect(getComputedStyle(root).padding).toBe(padding);
  });

  it('keeps the :host padding of a component flagged with the class', async () => {
    // the server-rendered markup carries the class: the rule matched it, but from the sublayer
    // base.css lands in, where the preflight beats it
    const { root } = await render('<mds-banner headline="Banner"></mds-banner>');
    const padding = getComputedStyle(root).padding;
    root.removeAttribute('hydrated');
    root.classList.add('hydrated');

    await loadPageStyles();

    expect(padding).not.toBe('0px');
    expect(getComputedStyle(root).padding).toBe(padding);
  });
});
