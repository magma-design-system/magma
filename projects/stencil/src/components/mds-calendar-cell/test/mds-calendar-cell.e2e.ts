import { render } from '@stencil/vitest';

const background = (cell: Element, part: string): string =>
  getComputedStyle(cell.shadowRoot!.querySelector(part)!).backgroundColor;

describe('mds-calendar-cell', () => {
  it('renders', async () => {
    const { root } = await render('<mds-calendar-cell></mds-calendar-cell>');

    expect(root).toHaveAttribute('hydrated');
  });

  it.each(['current', 'other'])(
    'paints selection="none" as a cell of the %s month without selection',
    async (month) => {
      const { root } = await render(`<div>
        <mds-calendar-cell label="1" month="${month}"></mds-calendar-cell>
        <mds-calendar-cell label="2" month="${month}" selection="none"></mds-calendar-cell>
        <mds-calendar-cell label="3" month="${month}" selection="middle"></mds-calendar-cell>
      </div>`);
      const [unselected, none, selected] = Array.from(root.querySelectorAll('mds-calendar-cell'));

      expect(background(none, '.area-background')).toBe(background(unselected, '.area-background'));
      expect(background(none, '.inner-dot')).toBe(background(unselected, '.inner-dot'));
      // what a selection paints, so the comparison above means something
      expect(background(selected, '.area-background')).not.toBe(
        background(unselected, '.area-background'),
      );
    },
  );
});
