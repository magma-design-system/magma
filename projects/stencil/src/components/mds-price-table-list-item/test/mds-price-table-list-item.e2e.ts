import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

// the icon fades its fill: read it once the transition is over
const settled = async (element: Element): Promise<void> => {
  await Promise.all(
    element
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );
};

describe('mds-price-table-list-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-list-item></mds-price-table-list-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // two items, so that the one the pointer is not on shows the colour without hover, wherever
  // the tests before this one left the pointer
  it('colours the supported icon with its hover colour under the pointer', async () => {
    // the item declares its properties on its own host: set them on the items
    const colours =
      '--mds-price-table-list-item-supported-icon-color: rgb(1 2 3); --mds-price-table-list-item-supported-icon-color-hover: rgb(4 5 6)';
    const { root } = await render(`
      <div>
        <mds-price-table-list-item supported style="${colours}">Assistenza</mds-price-table-list-item>
        <mds-price-table-list-item supported style="${colours}">Backup</mds-price-table-list-item>
      </div>`);
    const [hovered, other] = Array.from(root.querySelectorAll('mds-price-table-list-item'));
    const iconOf = (item: Element): Element => item.shadowRoot!.querySelector('.icon')!;

    await userEvent.hover(hovered);
    await settled(iconOf(hovered));
    await settled(iconOf(other));

    expect(getComputedStyle(iconOf(hovered)).fill).toBe('rgb(4, 5, 6)');
    expect(getComputedStyle(iconOf(other)).fill).toBe('rgb(1, 2, 3)');

    await userEvent.unhover(hovered);
  });
});
