import { newE2EPage } from '@stencil/core/testing';

describe('mds-pref-theme-variant-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-theme-variant-item></mds-pref-theme-variant-item>');

    const element = await page.find('mds-pref-theme-variant-item');
    expect(element).toHaveAttribute('hydrated');
  });
});
