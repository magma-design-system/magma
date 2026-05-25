import { newE2EPage } from '@stencil/core/testing';

describe('mds-input-date', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-input-date></mds-input-date>');

    const element = await page.find('mds-input-date');
    expect(element).toHaveAttribute('hydrated');
  });
});
