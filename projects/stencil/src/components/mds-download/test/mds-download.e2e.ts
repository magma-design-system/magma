import { newE2EPage } from '@stencil/core/testing';

describe('mds-download', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-download></mds-download>');

    const element = await page.find('mds-download');
    expect(element).toHaveClass('hydrated');
  });
});
