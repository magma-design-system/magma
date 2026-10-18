import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
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

// #824: the props always wrote the radius and the angles inline, so a stylesheet could not set
// --mds-radial-menu-radius, -angle-start and -angle-end
describe('mds-radial-menu geometry', () => {
  let sheet: HTMLStyleElement;

  beforeEach(() => {
    mockIconFetch();
    sheet = document.createElement('style');
    sheet.textContent = `
      mds-radial-menu { --mds-radial-menu-delay: 0s; --mds-radial-menu-transition-duration: 0s; }
      .fan {
        --mds-radial-menu-angle-start: 0deg;
        --mds-radial-menu-angle-end: 180deg;
        --mds-radial-menu-radius: 6rem;
      }`;
    document.head.append(sheet);
  });

  afterEach(() => sheet.remove());

  const menu = (attributes: string, items = 2) =>
    render(`
      <mds-radial-menu opened ${attributes}>
        ${'<mds-radial-menu-item slot="item" icon="mi/baseline/edit" tooltip="Modifica"></mds-radial-menu-item>'.repeat(items)}
      </mds-radial-menu>`);

  /** Where each item sits, from the centre of the menu: x to the right, y downwards. */
  const offsets = async (root: HTMLElement): Promise<number[][]> => {
    const items = Array.from(root.querySelectorAll('mds-radial-menu-item'));
    await Promise.all(
      items.flatMap((item) =>
        item
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition)
          .map((animation) => animation.finished),
      ),
    );
    return items.map((item) => {
      const [x, y = '0'] = getComputedStyle(item).translate.split(' ');
      return [parseFloat(x), parseFloat(y)];
    });
  };

  it('lays a full ring out with the defaults', async () => {
    const { root } = await menu('', 4);
    const [first, second, third] = await offsets(root);

    expect(first[0]).toBeCloseTo(80);
    expect(second[0]).toBeCloseTo(0);
    expect(second[1]).toBeCloseTo(80);
    expect(third[0]).toBeCloseTo(-80);
  });

  it('takes the radius and the angles from a stylesheet', async () => {
    const { root } = await menu('class="fan"');
    const [first, second] = await offsets(root);

    expect(first[0]).toBeCloseTo(96);
    expect(first[1]).toBeCloseTo(0);
    expect(second[0]).toBeCloseTo(-96);
    expect(second[1]).toBeCloseTo(0);
  });

  it('lets a prop that is set win over the stylesheet', async () => {
    const { root } = await menu('class="fan" radius="3" angle-end="90"');
    const [first, second] = await offsets(root);

    expect(first[0]).toBeCloseTo(48);
    expect(second[0]).toBeCloseTo(0);
    expect(second[1]).toBeCloseTo(48);
  });

  it('spreads the items backwards when the start angle is the greater one', async () => {
    const { root } = await menu('angle-start="180" angle-end="0" radius="3"');
    const [first, second] = await offsets(root);

    expect(first[0]).toBeCloseTo(-48);
    expect(second[0]).toBeCloseTo(48);
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
