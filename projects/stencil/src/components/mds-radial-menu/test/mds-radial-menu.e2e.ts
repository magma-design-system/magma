import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { userEvent } from 'vitest/browser';

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

// nothing closed the open menu but the trigger: the backdrop takes no pointer (#820)
describe('mds-radial-menu closing', () => {
  const stage = async () => {
    const rendered = await render(
      `<div>
         <button id="outside">Outside</button>
         <mds-radial-menu><mds-radial-menu-item slot="item" icon="mi/baseline/add"></mds-radial-menu-item></mds-radial-menu>
       </div>`,
    );
    const menu = rendered.root.querySelector('mds-radial-menu')!;
    const trigger = menu.shadowRoot!.querySelector<HTMLElement>('.menu-button')!;
    return { ...rendered, menu, trigger };
  };

  it('closes on a click outside the menu, not on one inside it', async () => {
    const { root, menu, trigger, waitForChanges } = await stage();

    await userEvent.click(trigger);
    await waitForChanges();
    expect(menu).toHaveAttribute('opened');

    menu.querySelector<HTMLElement>('mds-radial-menu-item')!.click();
    await waitForChanges();
    expect(menu).toHaveAttribute('opened');

    await userEvent.click(root.querySelector('#outside')!);
    await waitForChanges();
    expect(menu).not.toHaveAttribute('opened');
  });

  it('closes on Escape and gives the focus back to the trigger', async () => {
    const { menu, trigger, waitForChanges } = await stage();

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitForChanges();
    expect(menu).toHaveAttribute('opened');

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Escape}');
    await waitForChanges();

    expect(menu).not.toHaveAttribute('opened');
    expect(menu.shadowRoot!.activeElement).toBe(trigger);
  });
});
