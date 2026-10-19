import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { describeConditionalSlot } from '@test/slot';

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
