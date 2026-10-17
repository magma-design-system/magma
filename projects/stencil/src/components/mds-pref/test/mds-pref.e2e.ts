import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-pref', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref></mds-pref>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #789: a settings page unmounting its own mds-pref used to drop the attribute
  // while the app controller was still mounted, handing the palette back to the OS
  it('keeps data-magma-pref on <html> until the last instance unmounts', async () => {
    const { root, waitForChanges } = await render(`
      <div>
        <mds-pref controller class="controller"></mds-pref>
        <mds-pref class="settings"></mds-pref>
      </div>
    `);
    const html = document.documentElement;
    expect(html).toHaveAttribute('data-magma-pref');

    root.querySelector('.settings')!.remove();
    await waitForChanges();
    expect(html).toHaveAttribute('data-magma-pref');

    root.querySelector('.controller')!.remove();
    await waitForChanges();
    expect(html).not.toHaveAttribute('data-magma-pref');
  });

  // #922: a move disconnects the host and connects it again, while componentDidLoad
  // runs only once: what it set up has to follow the connection instead
  describe('moved in the DOM', () => {
    const settle = async (waitForChanges: () => Promise<void>): Promise<void> => {
      await waitForChanges();
      await new Promise((resolve) => setTimeout(resolve));
    };

    it('keeps data-magma-pref on <html> while it is connected', async () => {
      const { root, waitForChanges } = await render(`
        <div>
          <div class="sidebar"><mds-pref></mds-pref></div>
          <div class="menu"></div>
        </div>
      `);
      const html = document.documentElement;

      root.querySelector('.menu')!.append(root.querySelector('mds-pref')!);
      expect(html).toHaveAttribute('data-magma-pref');
      await settle(waitForChanges);
      expect(html).toHaveAttribute('data-magma-pref');

      root.querySelector('mds-pref')!.remove();
      await settle(waitForChanges);
      expect(html).not.toHaveAttribute('data-magma-pref');
    });

    it('keeps locking the mode item from the theme', async () => {
      const { root, waitForChanges } = await render(`
        <div>
          <div class="sidebar">
            <mds-pref>
              <mds-pref-mode mode="dark"></mds-pref-mode>
              <mds-pref-theme>
                <mds-pref-theme-item name="default" scheme="all"></mds-pref-theme-item>
                <mds-pref-theme-item name="cool" scheme="light"></mds-pref-theme-item>
              </mds-pref-theme>
            </mds-pref>
          </div>
          <div class="menu"></div>
        </div>
      `);

      root.querySelector('.menu')!.append(root.querySelector('mds-pref')!);
      await settle(waitForChanges);
      root.querySelector<HTMLElement>('mds-pref-theme-item[name="cool"]')!.click();
      await settle(waitForChanges);

      expect(root.querySelector<HTMLMdsPrefModeElement>('mds-pref-mode')!.lockedScheme).toBe(
        'light',
      );
    });

    it('keeps asking for a reload in controller mode', async () => {
      const { root, waitForChanges } = await render(`
        <div>
          <div class="sidebar">
            <mds-pref controller>
              <mds-pref-consumption></mds-pref-consumption>
            </mds-pref>
          </div>
          <div class="menu"></div>
        </div>
      `);
      const pref = root.querySelector('mds-pref')!;

      root.querySelector('.menu')!.append(pref);
      await settle(waitForChanges);
      root.querySelector('mds-pref-consumption')!.dispatchEvent(
        new CustomEvent('mdsPrefChange', {
          bubbles: true,
          composed: true,
          detail: { preference: 'consumption' },
        }),
      );
      await settle(waitForChanges);

      expect(pref.shadowRoot!.querySelector('.reload-required')).not.toBeNull();
    });
  });

  describe('lock-dark coordination', () => {
    // `cool` stands in for a light-only theme here; only its `scheme` matters
    const markup = `
      <mds-pref>
        <mds-pref-mode mode="dark"></mds-pref-mode>
        <mds-pref-theme>
          <mds-pref-theme-item name="default" scheme="all"></mds-pref-theme-item>
          <mds-pref-theme-item name="cool" scheme="light"></mds-pref-theme-item>
        </mds-pref-theme>
      </mds-pref>
    `;

    const clickVariant = (pref: HTMLElement, name: string): void => {
      pref.querySelector<HTMLElement>(`mds-pref-theme-item[name="${name}"]`)?.click();
    };

    it('locks the dark item when a light-only theme is selected, without touching the stored mode preference', async () => {
      const { root, waitForChanges } = await render(markup);

      clickVariant(root, 'cool');
      await waitForChanges();

      const theme = root.querySelector<HTMLMdsPrefModeElement>('mds-pref-mode')!;
      const dark = theme.shadowRoot!.querySelector('.item--dark');
      expect(theme).toHaveAttribute('locked-scheme');
      expect(theme.lockedScheme).toBe('light');
      expect(dark).toHaveAttribute('disabled');

      // the mode preference is preserved on both the prop and localStorage
      expect(theme.mode).toBe('dark');
      expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
    });

    it('clears the lock when an all-scheme theme is selected', async () => {
      const { root, waitForChanges } = await render(markup);

      clickVariant(root, 'cool');
      await waitForChanges();
      const theme = root.querySelector<HTMLMdsPrefModeElement>('mds-pref-mode')!;
      expect(theme).toHaveAttribute('locked-scheme');

      clickVariant(root, 'default');
      await waitForChanges();

      expect(theme).not.toHaveAttribute('locked-scheme');
      expect(theme.shadowRoot!.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    });
  });

  // #826: the size reached the controls only through its watcher, which does not run for the value
  // of load: a panel sized in the markup never sized them
  describe('size', () => {
    beforeEach(mockIconFetch);

    it('reaches the controls on load, and the ones added later', async () => {
      const { root } = await render(`
        <mds-pref size="sm">
          <mds-pref-animation></mds-pref-animation>
          <mds-pref-contrast></mds-pref-contrast>
        </mds-pref>
      `);

      expect(root.querySelector('mds-pref-animation')).toEqualAttribute('size', 'sm');
      expect(root.querySelector('mds-pref-contrast')).toEqualAttribute('size', 'sm');

      root.appendChild(document.createElement('mds-pref-consumption'));
      await vi.waitFor(() =>
        expect(root.querySelector('mds-pref-consumption')).toEqualAttribute('size', 'sm'),
      );
    });

    it('leaves the size of each control alone when the panel has none', async () => {
      const { root } = await render(`
        <mds-pref>
          <mds-pref-animation size="sm"></mds-pref-animation>
        </mds-pref>
      `);

      expect(root.querySelector('mds-pref-animation')).toEqualAttribute('size', 'sm');
    });
  });
});
