import { newE2EPage } from '@stencil/core/testing';

describe('mds-paginator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-paginator></mds-paginator>');

    const element = await page.find('mds-paginator');
    expect(element).toHaveClass('hydrated');
  });
});
