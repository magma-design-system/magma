import { render } from '@stencil/vitest';

describe('mds-pref', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref></mds-pref>');

    expect(root).toHaveAttribute('hydrated');
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
});
