import { newE2EPage } from '@stencil/core/testing';

describe('mds-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-modal></mds-modal>');

    const element = await page.find('mds-modal');

    expect(element).toHaveAttribute('hydrated');
    expect(element).toHaveAttribute('position');

    expect(element.getAttribute('position')).toBe('center');

    expect(element).not.toHaveAttribute('opened');
  });

  it('renders opened', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-modal opened="true"></mds-modal>');

    const element = await page.find('mds-modal');

    expect(element).toHaveAttribute('opened');
  });

  it('can be closed', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-modal opened="true"></mds-modal>');

    const element = await page.find('mds-modal');

    expect(element.getAttribute('opened')).not.toBe('false');

    // The native <dialog> fills the viewport and centers the window, so a click
    // on a corner lands on the backdrop area (target === dialog), which dismisses
    // the modal under the default `relaxed` interaction.
    await page.mouse.click(5, 5);

    await page.waitForChanges();

    expect(element).not.toHaveAttribute('opened');
  });
});
