import { newE2EPage } from '@stencil/core/testing';

describe('mds-keyboard-key', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-keyboard-key></mds-keyboard-key>');

    const element = await page.find('mds-keyboard-key');
    expect(element).toHaveAttribute('hydrated');
  });
});
