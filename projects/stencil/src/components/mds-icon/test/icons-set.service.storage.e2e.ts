import { render, vi } from '@stencil/vitest';
// The entry a product imports (the package root). As in a product, it is not the copy of the
// service the icons run: they come from the prebuilt loader (src/test/setup.ts), and the two
// copies agree through the path on globalThis and the event on window.
import { IconsSetService } from '../../../index';

const storageKey = 'mdsIconSvgPath';

// The key under which every bundled copy of the service keeps the path (icons-set.service.ts):
// deleting it gives each test a page that has set no path yet
const SVG_PATH_GLOBAL = Symbol.for('@maggioli-design-system/magma:mdsIconSvgPath');
const forgetSvgPath = (): void => {
  delete (globalThis as unknown as Record<symbol, unknown>)[SVG_PATH_GLOBAL];
};

// The folders of the icon server: each answers with an svg named after it, so a test reads
// which path an icon came from; anything else, a slug fetched without a path too, is a 404
const folders = ['/from-code/', '/from-code-again/', '/from-storage/'];
const svgOf = (folder: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" id="${folder.replaceAll('/', '')}" viewBox="0 0 24 24"><path d="M0,0H24V24H0Z" /></svg>`;

// What a document sandboxed without allow-same-origin does: reading the property throws
const blockSessionStorage = () =>
  vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
    throw new DOMException(
      "Failed to read the 'sessionStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag.",
      'SecurityError',
    );
  });

const iconOf = (root: HTMLElement, folder: string): Element | null =>
  root.shadowRoot!.querySelector(`svg#${folder.replaceAll('/', '')}`);

// Each test uses icon names of its own: the service keeps every icon it loaded in memory
describe('IconsSetService from the package root', () => {
  beforeEach(() => {
    forgetSvgPath();
    vi.spyOn(window, 'fetch').mockImplementation((input) => {
      const folder = folders.find((one) => String(input).startsWith(one));
      return Promise.resolve(
        folder
          ? new Response(svgOf(folder), { status: 200 })
          : new Response('', { status: 404, statusText: 'Not Found' }),
      );
    });
    // the service reports an icon it cannot load
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.removeItem(storageKey);
    // an icon left on the page would load again on the setSvgPath of the next test
    document.body.querySelectorAll('.stencil-component-stage').forEach((stage) => stage.remove());
  });

  describe('with sessionStorage throwing SecurityError', () => {
    it('loads an icon mounted before the path once the path is set', async () => {
      const storage = blockSessionStorage();
      const { root } = await render('<mds-icon name="blocked/before"></mds-icon>');
      // no path in memory and none from the storage: the bare slug finds no file
      await vi.waitFor(() => expect(window.fetch).toHaveBeenCalledWith('blocked/before'));
      expect(storage).toHaveBeenCalled();
      expect(root.shadowRoot!.querySelector('svg')).toBeNull();
      const reads = storage.mock.calls.length;

      IconsSetService.setSvgPath('/from-code/');

      await vi.waitFor(() => expect(iconOf(root, '/from-code/')).not.toBeNull());
      expect(window.fetch).toHaveBeenLastCalledWith('/from-code/blocked/before.svg');
      // the path is in memory: the storage is not read again
      expect(storage).toHaveBeenCalledTimes(reads);
    });

    it('loads an icon mounted after the path, without reading the storage', async () => {
      const storage = blockSessionStorage();
      IconsSetService.setSvgPath('/from-code/');

      const { root } = await render('<mds-icon name="blocked/after"></mds-icon>');

      await vi.waitFor(() => expect(iconOf(root, '/from-code/')).not.toBeNull());
      expect(storage).not.toHaveBeenCalled();
    });

    it('loads a mounted icon again when the path changes', async () => {
      blockSessionStorage();
      IconsSetService.setSvgPath('/from-code/');
      const { root } = await render('<mds-icon name="blocked/changed"></mds-icon>');
      await vi.waitFor(() => expect(iconOf(root, '/from-code/')).not.toBeNull());

      IconsSetService.setSvgPath('/from-code-again/');

      await vi.waitFor(() => expect(iconOf(root, '/from-code-again/')).not.toBeNull());
      expect(iconOf(root, '/from-code/')).toBeNull();
    });
  });

  describe('and the mdsIconSvgPath key of sessionStorage', () => {
    it('loads the icons from the key when no path is set in code', async () => {
      window.sessionStorage.setItem(storageKey, '/from-storage/');

      const { root } = await render('<mds-icon name="storage/only"></mds-icon>');

      await vi.waitFor(() => expect(iconOf(root, '/from-storage/')).not.toBeNull());
      expect(IconsSetService.getSvgPath()).toBe('/from-storage/');
    });

    it('takes a path set in code before the first icon over the key', async () => {
      window.sessionStorage.setItem(storageKey, '/from-storage/');
      IconsSetService.setSvgPath('/from-code/');

      const { root } = await render('<mds-icon name="storage/code-first"></mds-icon>');

      await vi.waitFor(() => expect(iconOf(root, '/from-code/')).not.toBeNull());
      expect(window.fetch).not.toHaveBeenCalledWith(expect.stringMatching(/^\/from-storage\//));
    });

    it('takes a path set in code after the icons loaded from the key', async () => {
      window.sessionStorage.setItem(storageKey, '/from-storage/');
      const { root } = await render('<mds-icon name="storage/code-later"></mds-icon>');
      await vi.waitFor(() => expect(iconOf(root, '/from-storage/')).not.toBeNull());

      IconsSetService.setSvgPath('/from-code/');

      await vi.waitFor(() => expect(iconOf(root, '/from-code/')).not.toBeNull());
      expect(IconsSetService.getSvgPath()).toBe('/from-code/');
    });
  });
});
