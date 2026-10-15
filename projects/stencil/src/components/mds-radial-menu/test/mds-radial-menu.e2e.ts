import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';

describe('mds-radial-menu', () => {
  it('renders', async () => {
    const { root } = await render('<mds-radial-menu></mds-radial-menu>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// #937: the trigger is an icon-only button, named after what a click does
describe('mds-radial-menu trigger', () => {
  useLanguage('it');

  it('is a button that says it opens the menu, and then that it closes it', async () => {
    const { root, waitForChanges } = await render('<mds-radial-menu></mds-radial-menu>');
    const trigger = root.shadowRoot!.querySelector<HTMLElement>('.menu-button')!;

    expect(trigger).toEqualAttributes({ role: 'button', 'aria-label': 'Apri il menu' });

    trigger.click();
    await waitForChanges();

    expect(trigger).toEqualAttribute('aria-label', 'Chiudi il menu');
  });
});
