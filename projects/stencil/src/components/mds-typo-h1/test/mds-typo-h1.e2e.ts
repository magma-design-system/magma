import { newE2EPage } from '@stencil/core/testing';

describe('mds-typo-h1', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-typo-h1></mds-typo-h1>');

    const element = await page.find('mds-typo-h1');
    expect(element).toHaveClass('hydrated');
  });
});
