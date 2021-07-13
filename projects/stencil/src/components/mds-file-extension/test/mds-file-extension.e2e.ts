import { newE2EPage } from '@stencil/core/testing';

describe('mds-file-extension', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-file-extension></mds-file-extension>');

    const element = await page.find('mds-file-extension');
    expect(element).toHaveClass('hydrated');
  });
});
