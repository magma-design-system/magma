import { newE2EPage } from '@stencil/core/testing';

describe('mds-status-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-status-bar></mds-status-bar>');

    const element = await page.find('mds-status-bar');
    expect(element).toHaveAttribute('hydrated');
  });
});
