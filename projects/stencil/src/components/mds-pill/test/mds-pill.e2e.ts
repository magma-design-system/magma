import { newE2EPage } from '@stencil/core/testing';

describe('mds-pill', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pill></mds-pill>');

    const element = await page.find('mds-pill');
    expect(element).toHaveClass('hydrated');
  });
});
