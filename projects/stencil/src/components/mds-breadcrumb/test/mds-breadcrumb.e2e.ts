import { render } from '@stencil/vitest';

const trail = (style: string, selected = 1): string => `
  <mds-breadcrumb style="${style}">
    <mds-breadcrumb-item label="Home"${selected === 0 ? ' selected' : ''}></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Archivio"${selected === 1 ? ' selected' : ''}></mds-breadcrumb-item>
  </mds-breadcrumb>`;

// the buttons fade their colours: read them once the transition is over
const settled = async (element: Element): Promise<void> => {
  await Promise.all(
    element
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );
};

const buttonOf = (item: Element): HTMLElement =>
  item.shadowRoot!.querySelector<HTMLElement>('mds-button')!;

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb></mds-breadcrumb>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('custom properties', () => {
    it('paints the selected item with the colours set on the breadcrumb', async () => {
      const { root } = await render(
        trail(
          '--mds-breadcrumb-button-color-selected: rgb(1 2 3); --mds-breadcrumb-button-background-selected: rgb(4 5 6)',
        ),
      );
      const [home, archive] = root.querySelectorAll('mds-breadcrumb-item');
      await settled(buttonOf(home));
      await settled(buttonOf(archive));

      expect(getComputedStyle(buttonOf(archive)).color).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(buttonOf(archive)).backgroundColor).toBe('rgb(4, 5, 6)');
      expect(getComputedStyle(buttonOf(home)).color).not.toBe('rgb(1, 2, 3)');
    });

    it.each([
      ['--mds-breadcrumb-button-color-current', 'rgb(7, 8, 9)'],
      ['--mds-breadcrumb-current-button-color', 'rgb(10, 11, 12)'],
    ])('still reads the deprecated %s', async (name, colour) => {
      const { root } = await render(trail(`${name}: ${colour}`));
      const selected = buttonOf(root.querySelector('mds-breadcrumb-item[selected]')!);
      await settled(selected);

      expect(getComputedStyle(selected).color).toBe(colour);
    });

    it('gives the disabled back button its background', async () => {
      const { root } = await render(
        trail('--mds-breadcrumb-button-background-disabled: rgb(13 14 15)', 0),
      );
      const back = root.shadowRoot!.querySelector<HTMLElement>('.back')!;

      expect(back).toHaveAttribute('disabled');
      await settled(back);
      expect(getComputedStyle(back).backgroundColor).toBe('rgb(13, 14, 15)');
    });
  });
});
