import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { describeConditionalSlot } from '@test/slot';
import { page } from 'vitest/browser';

describe('mds-header-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-header-bar><span>Logo</span></mds-header-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-header-bar><span>Logo</span></mds-header-bar>',
    slot: 'nav',
    region: '.nav',
  });

  it('opens and closes the menu of its mds-header with setOpened', async () => {
    const { root, waitForChanges } = await render(
      '<mds-header><mds-header-bar><span>Logo</span></mds-header-bar><div slot="menu">Menu</div></mds-header>',
    );
    const bar = root.querySelector('mds-header-bar')!;
    const modal = root.shadowRoot!.querySelector('mds-modal')!;

    await bar.setOpened(true);
    await waitForChanges();
    expect(modal.opened).toBe(true);

    await bar.setOpened(false);
    await waitForChanges();
    expect(modal.opened).toBeFalsy();
  });
});

// #1189 widths/page: the content of the bar starts where the content of a page-frame does, and a
// theme that moves the page moves the bar with it
describe('mds-header-bar on the frame of the page', () => {
  const content = async (): Promise<DOMRect> => {
    const { root } = await render('<mds-header-bar><span>Logo</span></mds-header-bar>');
    return root.shadowRoot!.querySelector('.content')!.getBoundingClientRect();
  };

  afterEach(async () => {
    document.documentElement.style.removeProperty('--magma-width-page');
    // the size of the browser project in vitest.config.mts
    await page.viewport(1280, 800);
  });

  it.each([
    [1440, 80, 1280],
    [375, 24, 327],
  ])('on a window of %ipx starts its content at %ipx, %ipx wide', async (width, left, size) => {
    await page.viewport(width, 800);
    const box = await content();

    expect([box.left, box.width]).toEqual([left, size]);
  });

  it('follows a theme that moves the page', async () => {
    await page.viewport(1440, 800);
    document.documentElement.style.setProperty('--magma-width-page', '1024px');
    const box = await content();

    expect([box.left, box.width]).toEqual([208, 1024]);
  });
});

// #937: the menu toggle is an icon-only button
describe('mds-header-bar menu toggle', () => {
  useLanguage('it');

  it('is a button named in the current language', async () => {
    const { root } = await render('<mds-header-bar><span>Logo</span></mds-header-bar>');

    expect(root.shadowRoot!.querySelector('.menu')).toEqualAttributes({
      role: 'button',
      'aria-label': 'Apri il menu',
    });
  });
});
