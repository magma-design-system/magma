import { render, vi } from '@stencil/vitest';
import { IconsSetService } from '../services/icons-set.service';

const mdiAlien =
  '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-alien" width="24" height="24" viewBox="0 0 24 24"><path d="M12,3C16.97,3 21,6.58 21,11C21,15.42 15,21 12,21C9,21 3,15.42 3,11C3,6.58 7.03,3 12,3M10.31,10.93C9.29,9.29 7.47,8.58 6.25,9.34C5.03,10.1 4.87,12.05 5.89,13.69C6.92,15.33 8.74,16.04 9.96,15.28C11.18,14.5 11.33,12.57 10.31,10.93M13.69,10.93C12.67,12.57 12.82,14.5 14.04,15.28C15.26,16.04 17.08,15.33 18.11,13.69C19.13,12.05 18.97,10.1 17.75,9.34C16.53,8.58 14.71,9.29 13.69,10.93M12,17.75C10,17.75 9.5,17 9.5,17C9.5,17.03 10,19 12,19C14,19 14.5,17 14.5,17C14.5,17 14,17.75 12,17.75Z" /></svg>';
const fooBarIcon = 'foo/bar';

describe('mds-icon', () => {
  beforeEach(async () => {
    // the icons are fetched from the network: answer with a fixed SVG, 404 for the unknown one
    vi.spyOn(window, 'fetch').mockImplementation((input) => {
      if (!String(input).includes(fooBarIcon)) {
        return Promise.resolve(new Response(mdiAlien, { status: 200 }));
      }

      return Promise.resolve(new Response('', { status: 404, statusText: 'mocked status text' }));
    });

    IconsSetService.setSvgPath('assets/svg/');
  });

  it('renders', async () => {
    const { root } = await render('<mds-icon></mds-icon>');

    expect(root).not.toBeNull();
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
});
