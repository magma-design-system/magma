import { newE2EPage } from '@stencil/core/testing';

describe('mds-avatar-stack', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-avatar-stack></mds-avatar-stack>');

    const element = await page.find('mds-avatar-stack');
    expect(element).toHaveAttribute('hydrated');
  });
});
