import { newE2EPage } from '@stencil/core/testing';

describe('mds-pref-theme', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme></mds-pref-theme>');

    const element = await page.find('mds-pref-theme');
    expect(element).toHaveAttribute('hydrated');
  });

  it('locks only the dark item when locked-scheme is light', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme mode="light" locked-scheme="light"></mds-pref-theme>');
    await page.waitForChanges();

    const dark = await page.find('mds-pref-theme >>> .item--dark');
    const light = await page.find('mds-pref-theme >>> .item--light');
    const system = await page.find('mds-pref-theme >>> .item--system');

    expect(dark).toHaveAttribute('disabled');
    expect(light).not.toHaveAttribute('disabled');
    expect(system).not.toHaveAttribute('disabled');
  });

  it('locks only the light item when locked-scheme is dark', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme mode="dark" locked-scheme="dark"></mds-pref-theme>');
    await page.waitForChanges();

    const light = await page.find('mds-pref-theme >>> .item--light');
    const dark = await page.find('mds-pref-theme >>> .item--dark');
    const system = await page.find('mds-pref-theme >>> .item--system');

    expect(light).toHaveAttribute('disabled');
    expect(dark).not.toHaveAttribute('disabled');
    expect(system).not.toHaveAttribute('disabled');
  });

  it('locks nothing when locked-scheme is absent', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme mode="light"></mds-pref-theme>');
    await page.waitForChanges();

    const light = await page.find('mds-pref-theme >>> .item--light');
    const system = await page.find('mds-pref-theme >>> .item--system');
    const dark = await page.find('mds-pref-theme >>> .item--dark');

    expect(light).not.toHaveAttribute('disabled');
    expect(system).not.toHaveAttribute('disabled');
    expect(dark).not.toHaveAttribute('disabled');
  });

  it('keeps the stored mode preference: a locked dark item stays selected and clicking it is a no-op', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme mode="dark" locked-scheme="light"></mds-pref-theme>');
    await page.waitForChanges();

    const element = await page.find('mds-pref-theme');
    const dark = await page.find('mds-pref-theme >>> .item--dark');

    // the stored preference (dark) is preserved and reflected as selected, but locked
    expect(await element.getProperty('mode')).toBe('dark');
    expect(dark).toHaveAttribute('selected');
    expect(dark).toHaveAttribute('disabled');
    expect(await page.evaluate(() => localStorage.getItem('mdsPrefTheme'))).toBe('dark');

    // clicking the locked item must not change the mode nor the stored preference
    await page.evaluate(() => {
      document
        .querySelector('mds-pref-theme')
        ?.shadowRoot?.querySelector<HTMLElement>('.item--dark')
        ?.click();
    });
    await page.waitForChanges();

    expect(await element.getProperty('mode')).toBe('dark');
    expect(await page.evaluate(() => localStorage.getItem('mdsPrefTheme'))).toBe('dark');
  });
});
