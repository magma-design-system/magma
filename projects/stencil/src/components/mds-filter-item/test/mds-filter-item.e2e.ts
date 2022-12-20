import { newE2EPage } from '@stencil/core/testing';

describe('mds-filter-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-filter-item></mds-filter-item>');

    const element = await page.find('mds-filter-item');
    expect(element).toHaveClass('hydrated');
  });
});
