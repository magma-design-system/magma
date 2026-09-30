import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

/**
 * The arrow transitions its fill over --duration-200, and the transition does not exist yet
 * on the frame the component hydrates: a read taken right away catches the colour in flight,
 * a different blue every run. Sit out the transition, then poll until the painted value stops
 * moving - waiting on getAnimations() is not enough, the browser starts a second pass.
 */
const paintedFill = async (element: Element): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let previous = '';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const current = getComputedStyle(element).fill;
    if (current === previous) return current;
    previous = current;
  }

  return previous;
};

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
        '<div><span id="park">.</span><mds-input-select id="select"></mds-input-select><mds-input-date id="date"></mds-input-date></div>',
      );

      const select = root.querySelector('#select') as HTMLElement;
      const date = root.querySelector('#date') as HTMLElement;
      const arrow = select.shadowRoot!.querySelector('.icon') as HTMLElement;
      const calendar = date.shadowRoot!.querySelector('.action-open-calendar') as HTMLElement;

      // the pointer stays where the last case left it, and :host(:hover) swaps the arrow to
      // its hover colour: park it on something inert before reading the resting state
      await userEvent.hover(root.querySelector('#park')!);

      const fill = await paintedFill(arrow);
      const arrowStyle = getComputedStyle(arrow);
      // one is a computed `fill` and the other the value of a custom property, so
      // the same colour arrives spelled `rgb(36, 103, 231)` on one side and
      // `rgb(36 103 231)` on the other
      const colore = (value: string) => value.replace(/[\s,]+/g, ' ').trim();

      // the date drives its own icon through --mds-button-color, so the comparison
      // is against the value that reaches the button, not against a literal
      expect(colore(fill)).toBe(
        colore(getComputedStyle(calendar).getPropertyValue('--mds-button-color')),
      );
      expect(arrowStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('accessible name', () => {
    it('names the select after the aria-label of the host', async () => {
      const { root } = await render<HTMLMdsInputSelectElement>(
        '<mds-input-select aria-label="Film"><option value="1">First contact</option></mds-input-select>',
      );

      expect(root.shadowRoot!.querySelector('select')).toEqualAttribute('aria-label', 'Film');
    });
  });
});
