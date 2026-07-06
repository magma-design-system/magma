import { newE2EPage } from '@stencil/core/testing';

describe('mds-pref-language-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-language-item></mds-pref-language-item>');

    const element = await page.find('mds-pref-language-item');
    expect(element).toHaveAttribute('hydrated');
  });

  it('renders the language name for a known code', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-language-item code="it"></mds-pref-language-item>');

    const element = await page.find('mds-pref-language-item');
    expect(element).toHaveAttribute('hydrated');

    const button = await page.find('mds-pref-language-item >>> mds-button');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Italiano');
  });

  it('does not throw and still hydrates when no code is set', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-language-item></mds-pref-language-item>');

    const element = await page.find('mds-pref-language-item');
    expect(element).toHaveAttribute('hydrated');

    // render() must reach its fallback instead of the lifecycle throwing.
    const button = await page.find('mds-pref-language-item >>> mds-button');
    expect(button).not.toBeNull();
  });
});
