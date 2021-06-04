import { newE2EPage } from '@stencil/core/testing';

describe('mds-text-paragraph', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-text-paragraph></mds-text-paragraph>');

    const element = await page.find('mds-text-paragraph');
    expect(element).toHaveClass('hydrated');
  });
});
