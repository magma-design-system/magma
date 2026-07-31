import { newE2EPage } from '@stencil/core/testing';

describe('mds-pref', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref></mds-pref>');

    const element = await page.find('mds-pref');
    expect(element).toHaveAttribute('hydrated');
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

    const clickVariant = (page, name: string): Promise<void> =>
      page.evaluate((themeName: string) => {
        document
          .querySelector<HTMLElement>(`mds-pref-theme-variant-item[name="${themeName}"]`)
          ?.click();
      }, name);

    it('locks the dark item when a light-only theme is selected, without touching the stored mode preference', async () => {
      const page = await newE2EPage();
      await page.setContent(markup);
      await page.waitForChanges();

      await clickVariant(page, 'cool');
      await page.waitForChanges();

      const theme = await page.find('mds-pref-theme');
      const dark = await page.find('mds-pref-theme >>> .item--dark');
      expect(theme).toHaveAttribute('locked-scheme');
      expect(await theme.getProperty('lockedScheme')).toBe('light');
      expect(dark).toHaveAttribute('disabled');

      // the mode preference is preserved on both the prop and localStorage
      expect(await theme.getProperty('mode')).toBe('dark');
      expect(await page.evaluate(() => localStorage.getItem('mdsPrefTheme'))).toBe('dark');
    });

    it('clears the lock when an all-scheme theme is selected', async () => {
      const page = await newE2EPage();
      await page.setContent(markup);
      await page.waitForChanges();

      await clickVariant(page, 'cool');
      await page.waitForChanges();
      expect(await page.find('mds-pref-theme')).toHaveAttribute('locked-scheme');

      await clickVariant(page, 'default');
      await page.waitForChanges();

      const theme = await page.find('mds-pref-theme');
      const dark = await page.find('mds-pref-theme >>> .item--dark');
      expect(theme).not.toHaveAttribute('locked-scheme');
      expect(dark).not.toHaveAttribute('disabled');
    });
  });
});
