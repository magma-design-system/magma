import { render } from '@stencil/vitest';
import { commands } from 'vitest/browser';
import { hydrate, renderToString } from '@test/ssr';
import base from '../../../styles/dist/css/base.css?raw';
import hydrated from '../../../styles/dist/css/hydrated.css?raw';

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, run in Node
    compileTailwind: (css: string) => Promise<string>;
  }
}

type Host = HTMLElement & { componentOnReady: () => Promise<unknown> };

const visibility = (element: Element): string => getComputedStyle(element).visibility;

/**
 * A host of a registered tag put in the page, read in the same task: its component has not
 * loaded yet, so it is the host a page shows before hydration.
 */
const beforeHydration = (className = ''): Host => {
  const host = document.createElement('mds-button') as Host;
  host.className = className;
  host.textContent = 'Paga';
  document.body.append(host);
  return host;
};

/**
 * The lazy loader hides every component until its hydrated flag is set, from a sheet outside any
 * cascade layer (the `hydratedFlag` of stencil.config.ts). Once the flag is set, that sheet hands
 * visibility back to the page (`revert-layer`): a utility in `@layer utilities` decides it as it
 * decides `display`, and with no rule at all the host inherits it (#1229).
 */
describe('the visibility of a hydrated component', () => {
  const hosts: Host[] = [];

  afterEach(() => {
    hosts.splice(0).forEach((host) => host.remove());
  });

  describe('with the styles of Magma and a Tailwind entry', () => {
    const urls: string[] = [];
    let tailwind: string;
    let sheet: HTMLStyleElement | undefined;

    /** An `@import` of the stylesheet into the layer, as the styles README documents it. */
    const importInto = (layer: string, css: string): string => {
      const url = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
      urls.push(url);
      return `@import url('${url}') layer(${layer});`;
    };

    beforeAll(async () => {
      // what `@import 'tailwindcss'` brings, its utilities in `@layer utilities`
      tailwind = await commands.compileTailwind(
        [
          "@import 'tailwindcss/theme.css' layer(theme);",
          "@import 'tailwindcss/preflight.css' layer(base);",
          "@import 'tailwindcss/utilities.css' layer(utilities) source(none);",
          "@source inline('invisible visible');",
        ].join('\n'),
      );
    });

    beforeEach(async () => {
      sheet = document.createElement('style');
      sheet.textContent = [
        '@layer reset, vendor, theme, base, components, utilities, overrides;',
        importInto('base', hydrated),
        importInto('base', base),
        tailwind,
      ].join('\n');
      const loaded = new Promise((resolve) => sheet!.addEventListener('load', resolve));
      document.head.append(sheet);
      await loaded;
    });

    afterEach(() => {
      sheet?.remove();
      urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
    });

    it('hides a hydrated host that carries invisible', async () => {
      const { root } = await render('<mds-button class="invisible">Paga</mds-button>');

      expect(root).toHaveAttribute('hydrated');
      expect(visibility(root)).toBe('hidden');
    });

    it('shows a hydrated host without it', async () => {
      const { root } = await render('<mds-button>Paga</mds-button>');

      expect(root).toHaveAttribute('hydrated');
      expect(visibility(root)).toBe('visible');
    });

    it('keeps a host hidden before hydration, even under visible', async () => {
      // the hiding before hydration stays outside the layers: no utility shows a host too early
      const host = beforeHydration('visible');
      hosts.push(host);

      expect(host).not.toHaveAttribute('hydrated');
      expect(visibility(host)).toBe('hidden');

      await host.componentOnReady();
      expect(visibility(host)).toBe('visible');
    });

    it('keeps an ancestor with visibility: hidden hiding the host', async () => {
      const { root } = await render(`<div>
        <div style="visibility: hidden"><mds-button id="inline">Paga</mds-button></div>
        <div class="invisible"><mds-button id="utility">Paga</mds-button></div>
      </div>`);

      expect(visibility(root.querySelector('#inline')!)).toBe('hidden');
      expect(visibility(root.querySelector('#utility')!)).toBe('hidden');
    });

    it('lets visible show a host inside an invisible ancestor', async () => {
      const { root } = await render(
        '<div class="invisible"><mds-button class="visible">Paga</mds-button></div>',
      );

      expect(visibility(root.querySelector('mds-button')!)).toBe('visible');
    });

    it('hides server-rendered markup that carries invisible once hydrated', async () => {
      const stage = await hydrate(
        await renderToString(
          '<mds-button id="hidden" class="invisible">Paga</mds-button><mds-button id="shown">Annulla</mds-button>',
        ),
      );

      expect(stage.querySelector('#hidden')).toHaveAttribute('hydrated');
      expect(visibility(stage.querySelector('#hidden')!)).toBe('hidden');
      expect(visibility(stage.querySelector('#shown')!)).toBe('visible');
    });
  });

  describe('with no stylesheet of the page', () => {
    it('hides a host before hydration and shows it once hydrated', async () => {
      // the sheet of the lazy loader alone, for a page that does not load hydrated.css
      const host = beforeHydration();
      hosts.push(host);

      expect(host).not.toHaveAttribute('hydrated');
      expect(visibility(host)).toBe('hidden');

      await host.componentOnReady();
      expect(host).toHaveAttribute('hydrated');
      expect(visibility(host)).toBe('visible');
    });

    it('keeps an ancestor with visibility: hidden hiding the host', async () => {
      const { root } = await render(
        '<div style="visibility: hidden"><mds-button>Paga</mds-button></div>',
      );

      expect(root.querySelector('mds-button')).toHaveAttribute('hydrated');
      expect(visibility(root.querySelector('mds-button')!)).toBe('hidden');
    });
  });
});
