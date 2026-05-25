import { newE2EPage } from '@stencil/core/testing';

describe('mds-button-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-button-group></mds-button-group>');

    const element = await page.find('mds-button-group');
    expect(element).toHaveAttribute('hydrated');
  });
});
