import { newE2EPage } from '@stencil/core/testing';

describe('mds-calendar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-calendar></mds-calendar>');

    const element = await page.find('mds-calendar');
    expect(element).toHaveAttribute('hydrated');
  });
});
