import { newE2EPage } from '@stencil/core/testing';

describe('mds-h1', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-h1></mds-h1>');

    const element = await page.find('mds-h1');
    expect(element).toHaveClass('hydrated');
  });
});
