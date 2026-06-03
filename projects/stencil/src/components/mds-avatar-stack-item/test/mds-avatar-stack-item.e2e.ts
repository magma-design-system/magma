import { newE2EPage } from '@stencil/core/testing';

describe('mds-avatar-stack-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-avatar-stack-item></mds-avatar-stack-item>');

    const element = await page.find('mds-avatar-stack-item');
    expect(element).toHaveAttribute('hydrated');
  });
});
