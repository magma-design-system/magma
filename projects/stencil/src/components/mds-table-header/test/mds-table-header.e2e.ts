import { newE2EPage } from '@stencil/core/testing';

describe('mds-table-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-table-header></mds-table-header>');

    const element = await page.find('mds-table-header');
    expect(element).toHaveClass('hydrated');
  });
});
