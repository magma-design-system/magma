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
        <mds-pref-theme mode="dark"></mds-pref-theme>
        <mds-pref-theme-variant>
          <mds-pref-theme-variant-item name="default" scheme="all"></mds-pref-theme-variant-item>
          <mds-pref-theme-variant-item name="cool" scheme="light"></mds-pref-theme-variant-item>
        </mds-pref-theme-variant>
      </mds-pref>
    `;

    const clickVariant = (pref: HTMLElement, name: string): void => {
      pref.querySelector<HTMLElement>(`mds-pref-theme-variant-item[name="${name}"]`)?.click();
    };

    it('locks the dark item when a light-only theme is selected, without touching the stored mode preference', async () => {
      const { root, waitForChanges } = await render(markup);

      clickVariant(root, 'cool');
      await waitForChanges();

      const theme = root.querySelector<HTMLMdsPrefThemeElement>('mds-pref-theme')!;
      const dark = theme.shadowRoot!.querySelector('.item--dark');
      expect(theme).toHaveAttribute('locked-scheme');
      expect(theme.lockedScheme).toBe('light');
      expect(dark).toHaveAttribute('disabled');

      // the mode preference is preserved on both the prop and localStorage
      expect(theme.mode).toBe('dark');
      expect(localStorage.getItem('mdsPrefTheme')).toBe('dark');
    });

    it('clears the lock when an all-scheme theme is selected', async () => {
      const { root, waitForChanges } = await render(markup);

      clickVariant(root, 'cool');
      await waitForChanges();
      const theme = root.querySelector<HTMLMdsPrefThemeElement>('mds-pref-theme')!;
      expect(theme).toHaveAttribute('locked-scheme');

      clickVariant(root, 'default');
      await waitForChanges();

      expect(theme).not.toHaveAttribute('locked-scheme');
      expect(theme.shadowRoot!.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    });
  });
});
