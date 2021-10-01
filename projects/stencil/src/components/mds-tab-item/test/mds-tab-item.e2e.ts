import { newE2EPage } from '@stencil/core/testing';

describe('mds-tab-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-tab-item></mds-tab-item>');

    const element = await page.find('mds-tab-item');
    expect(element).toHaveClass('hydrated');
  });
});
