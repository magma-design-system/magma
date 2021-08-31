import { newE2EPage } from '@stencil/core/testing';

describe('mds-table-footer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-table-footer></mds-table-footer>');

    const element = await page.find('mds-table-footer');
    expect(element).toHaveClass('hydrated');
  });
});
