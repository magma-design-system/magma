import { newE2EPage } from '@stencil/core/testing';

describe('mds-emoji', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-emoji></mds-emoji>');

    const element = await page.find('mds-emoji');
    expect(element).toHaveAttribute('hydrated');
  });
});
