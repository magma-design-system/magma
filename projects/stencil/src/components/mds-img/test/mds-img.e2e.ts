import { newE2EPage } from '@stencil/core/testing';

describe('mds-img', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-img></mds-img>');

    const element = await page.find('mds-img');
    expect(element).toHaveAttribute('hydrated');
    expect(true).toBe(true);
  });

  it('does not crash and keeps an empty alt when src is missing', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-img></mds-img>');

    const element = await page.find('mds-img');
    expect(element).toHaveAttribute('hydrated');
    expect(element).toEqualAttribute('alt', '');
  });

  it('derives the alt from the src file name when alt is not provided', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-img src="/assets/images/logo.svg"></mds-img>');

    const element = await page.find('mds-img');
    expect(element).toHaveAttribute('hydrated');
    expect(element).toEqualAttribute('alt', 'logo.svg');
  });
});
