import { render, vi } from '@stencil/vitest';
import { get } from 'idb-keyval';
import { IconsSetService } from '../services/icons-set.service';

const mdiAlien =
  '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-alien" width="24" height="24" viewBox="0 0 24 24"><path d="M12,3C16.97,3 21,6.58 21,11C21,15.42 15,21 12,21C9,21 3,15.42 3,11C3,6.58 7.03,3 12,3M10.31,10.93C9.29,9.29 7.47,8.58 6.25,9.34C5.03,10.1 4.87,12.05 5.89,13.69C6.92,15.33 8.74,16.04 9.96,15.28C11.18,14.5 11.33,12.57 10.31,10.93M13.69,10.93C12.67,12.57 12.82,14.5 14.04,15.28C15.26,16.04 17.08,15.33 18.11,13.69C19.13,12.05 18.97,10.1 17.75,9.34C16.53,8.58 14.71,9.29 13.69,10.93M12,17.75C10,17.75 9.5,17 9.5,17C9.5,17.03 10,19 12,19C14,19 14.5,17 14.5,17C14.5,17 14,17.75 12,17.75Z" /></svg>';
const fooBarIcon = 'foo/bar';
const svgPath = 'assets/svg/';

// an svg with an id of its own, to tell which response an icon shows
const svgWithId = (id: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 24 24"><path d="M0,0H24V24H0Z" /></svg>`;

// Holds the response of the next fetch: the returned function sends it, once the fetch started
const holdNextFetch = (): ((body: string) => void) => {
  let respond: (response: Response) => void = () => {};
  vi.mocked(window.fetch).mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        respond = resolve;
      }),
  );
  return (body) => respond(new Response(body, { status: 200 }));
};

// The service writes the svg to IndexedDB after returning it: once the entry is there, the icon
// has already received the svg of the held fetch
const waitForCachedSvg = (src: string): Promise<void> =>
  vi.waitFor(async () => expect(await get(`loader_${src}`)).toBeDefined());

describe('mds-icon', () => {
  beforeEach(async () => {
    // the icons are fetched from the network: answer with a fixed SVG, 404 for the unknown one
    vi.spyOn(window, 'fetch').mockImplementation((input) => {
      if (!String(input).includes(fooBarIcon)) {
        return Promise.resolve(new Response(mdiAlien, { status: 200 }));
      }

      return Promise.resolve(new Response('', { status: 404, statusText: 'mocked status text' }));
    });

    IconsSetService.setSvgPath(svgPath);
  });

  // an icon left on the page would load again on the setSvgPath of the next beforeEach
  afterEach(() => {
    document.body.querySelectorAll('.stencil-component-stage').forEach((stage) => stage.remove());
  });

  it('renders mdi/alien', async () => {
    const { root } = await render('<mds-icon name="mdi/alien"></mds-icon>');

    await vi.waitFor(() => expect(root.shadowRoot!.querySelector('svg')).not.toBeNull());
  });

  it('renders when the path is set via IconsSetService.setSvgPath (no sessionStorage)', async () => {
    // IconsSetService is the same singleton every <mds-icon> uses; setting the path on it
    // drives rendering entirely in memory, without touching sessionStorage.
    IconsSetService.setSvgPath('/assets/svg/');

    const { root } = await render('<mds-icon name="mdi/alien"></mds-icon>');

    await vi.waitFor(() => expect(root.shadowRoot!.querySelector('svg')).not.toBeNull());
  });

  it("shouldn't render unknown icon", async () => {
    // mds-icon reports the missing svg with console.error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { root, waitForChanges } = await render(`<mds-icon name="${fooBarIcon}"></mds-icon>`);
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('svg')).toBeNull();
  });

  describe('without a name', () => {
    it.each([
      ['no name attribute', '<mds-icon></mds-icon>'],
      ['an empty name', '<mds-icon name=""></mds-icon>'],
    ])('renders nothing, loads nothing and logs nothing with %s', async (_, template) => {
      const consoleError = vi.spyOn(console, 'error');
      const read = vi.spyOn(IDBObjectStore.prototype, 'get');

      const { root, waitForChanges } = await render(template);
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.icon')).toBeNull();
      expect(window.fetch).not.toHaveBeenCalled();
      expect(read).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it.each([
      ['the name attribute is removed', (icon: HTMLMdsIconElement) => icon.removeAttribute('name')],
      ['the name becomes empty', (icon: HTMLMdsIconElement) => icon.setAttribute('name', '')],
      [
        // what React and Angular do with an undefined value
        'the name property is set to undefined',
        (icon: HTMLMdsIconElement) => {
          (icon as { name?: string }).name = undefined;
        },
      ],
    ])('clears the icon when %s', async (_, clearName) => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render<HTMLMdsIconElement>(
        '<mds-icon name="mdi/alien"></mds-icon>',
      );
      await vi.waitFor(() => expect(root.shadowRoot!.querySelector('svg')).not.toBeNull());

      clearName(root);
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.icon')).toBeNull();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('does not show an icon that finishes loading after the name is removed', async () => {
      const respond = holdNextFetch();
      const { root, waitForChanges } = await render('<mds-icon name="race/removed"></mds-icon>');
      await vi.waitFor(() => expect(window.fetch).toHaveBeenCalledOnce());

      root.removeAttribute('name');
      await waitForChanges();
      respond(mdiAlien);
      await waitForCachedSvg(`${svgPath}race/removed.svg`);
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.icon')).toBeNull();
    });
  });

  it('shows the latest name when an earlier one finishes loading later', async () => {
    const respondFirst = holdNextFetch();
    const { root, waitForChanges } = await render('<mds-icon name="race/first"></mds-icon>');
    await vi.waitFor(() => expect(window.fetch).toHaveBeenCalledOnce());

    vi.mocked(window.fetch).mockResolvedValueOnce(
      new Response(svgWithId('second'), { status: 200 }),
    );
    root.setAttribute('name', 'race/second');
    await vi.waitFor(() => expect(root.shadowRoot!.querySelector('#second')).not.toBeNull());
    respondFirst(svgWithId('first'));
    await waitForCachedSvg(`${svgPath}race/first.svg`);
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('#first')).toBeNull();
    expect(root.shadowRoot!.querySelector('#second')).not.toBeNull();
  });

  describe('svg path updates', () => {
    it('keeps the icon of the new path when the one of the old path finishes loading later', async () => {
      const respondOldPath = holdNextFetch();
      const { root, waitForChanges } = await render('<mds-icon name="race/path"></mds-icon>');
      await vi.waitFor(() => expect(window.fetch).toHaveBeenCalledOnce());

      vi.mocked(window.fetch).mockResolvedValueOnce(
        new Response(svgWithId('new-path'), { status: 200 }),
      );
      IconsSetService.setSvgPath('/race/');
      await vi.waitFor(() => expect(root.shadowRoot!.querySelector('#new-path')).not.toBeNull());
      respondOldPath(svgWithId('old-path'));
      await waitForCachedSvg(`${svgPath}race/path.svg`);
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('#old-path')).toBeNull();
      expect(root.shadowRoot!.querySelector('#new-path')).not.toBeNull();
    });

    it('stops following them once the icon is removed from the page', async () => {
      const removed = await render('<mds-icon name="listener/removed"></mds-icon>');
      await vi.waitFor(() => expect(removed.root.shadowRoot!.querySelector('svg')).not.toBeNull());
      // render clears the page first: the first icon leaves it
      const kept = await render('<mds-icon name="listener/kept"></mds-icon>');
      await vi.waitFor(() => expect(kept.root.shadowRoot!.querySelector('svg')).not.toBeNull());
      expect(removed.root.isConnected).toBe(false);

      IconsSetService.setSvgPath('/listener/');

      await vi.waitFor(() =>
        expect(window.fetch).toHaveBeenCalledWith('/listener/listener/kept.svg'),
      );
      expect(window.fetch).not.toHaveBeenCalledWith('/listener/listener/removed.svg');
    });

    it('follows them again once the icon is back in the page', async () => {
      const { root } = await render('<mds-icon name="listener/moved"></mds-icon>');
      await vi.waitFor(() => expect(root.shadowRoot!.querySelector('svg')).not.toBeNull());
      const stage = root.parentElement!;

      root.remove();
      IconsSetService.setSvgPath('/moved/');
      stage.append(root);

      // the path set while the icon was out of the page
      await vi.waitFor(() =>
        expect(window.fetch).toHaveBeenCalledWith('/moved/listener/moved.svg'),
      );
      IconsSetService.setSvgPath('/moved-again/');
      await vi.waitFor(() =>
        expect(window.fetch).toHaveBeenCalledWith('/moved-again/listener/moved.svg'),
      );
    });
  });
});
