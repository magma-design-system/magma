import { render } from '@stencil/vitest';

describe('mds-input-select', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-select></mds-input-select>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the arrow', () => {
    it('is an mds-icon, like the rest of the input family', async () => {
      const { root } = await render('<mds-input-select></mds-input-select>');

      const arrow = root.shadowRoot!.querySelector('.icon')!;

      // it used to be an <i> with the svg inlined by hand, which sized and coloured
      // itself outside every convention the other inputs follow
      expect(arrow.tagName).toBe('MDS-ICON');
    });

    it('paints the same colour as the icon of mds-input-date, and nothing behind it', async () => {
      const { root } = await render(
        '<div><mds-input-select id="select"></mds-input-select><mds-input-date id="date"></mds-input-date></div>',
      );

      const select = root.querySelector('#select') as HTMLElement;
      const date = root.querySelector('#date') as HTMLElement;
      const arrow = select.shadowRoot!.querySelector('.icon') as HTMLElement;
      const calendar = date.shadowRoot!.querySelector('.action-open-calendar') as HTMLElement;

      const arrowStyle = getComputedStyle(arrow);
      // one is a computed `fill` and the other the value of a custom property, so
      // the same colour arrives spelled `rgb(36, 103, 231)` on one side and
      // `rgb(36 103 231)` on the other
      const colore = (value: string) => value.replace(/[\s,]+/g, ' ').trim();

      // the date drives its own icon through --mds-button-color, so the comparison
      // is against the value that reaches the button, not against a literal
      expect(colore(arrowStyle.fill)).toBe(
        colore(getComputedStyle(calendar).getPropertyValue('--mds-button-color')),
      );
      expect(arrowStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });
});
