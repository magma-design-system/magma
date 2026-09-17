import { render } from '@stencil/vitest';

/** The white panel under the icon: the element whose height used to jump. */
const info = (root: HTMLElement): HTMLElement =>
  root.shadowRoot!.querySelector<HTMLElement>('.info')!;

const value = (root: HTMLElement): HTMLElement =>
  root.shadowRoot!.querySelector<HTMLElement>('.value')!;

/** Lets the intersection observer and the animation settle before a box is read. */
const settle = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  await new Promise((resolve) => requestAnimationFrame(resolve));
};

describe('mds-kpi-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-kpi-item></mds-kpi-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('prints label and description straight away without a threshold', async () => {
    const { root } = await render(
      '<mds-kpi-item label="451" description="Progetti"></mds-kpi-item>',
    );

    expect(value(root).textContent?.trim()).toBe('451');
    expect(root.shadowRoot!.querySelector('.description')!.textContent?.trim()).toBe('Progetti');
  });

  describe('with a threshold, waiting to be scrolled into view', () => {
    /** Renders the item below the fold, where its observer has not fired yet. */
    const renderBelowTheFold = async () => {
      const result = await render(
        '<div><div style="height: 250vh"></div><mds-kpi-item label="451" description="Progetti" threshold="0.5" style="width: 300px"></mds-kpi-item></div>',
      );
      await settle();
      return result;
    };

    it('holds the line box open while the text is still to come', async () => {
      // the texts used to be rendered empty, and an empty text has no line box: the panel
      // measured 32px and jumped to 82px the moment the value arrived
      const { root } = await renderBelowTheFold();
      const item = root.querySelector('mds-kpi-item') as HTMLElement;

      const before = info(item).getBoundingClientRect().height;
      expect(value(item)).toHaveAttribute('text', '   ');

      item.scrollIntoView({ block: 'center' });
      await settle();

      expect(value(item)).toHaveAttribute('text', '451');
      expect(info(item).getBoundingClientRect().height).toBe(before);
    });
  });

  it('runs the value at the animation speed of the KPI, like the description', async () => {
    // the speed reached `.label`, a class the component never renders: the number ran at
    // the mds-text default of 0.5 while the line under it ran at 0.15
    const { root } = await render(
      '<mds-kpi><mds-kpi-item label="451" description="Progetti"></mds-kpi-item></mds-kpi>',
    );
    const item = root.querySelector('mds-kpi-item') as HTMLElement;
    const speed = (element: Element) =>
      Number(getComputedStyle(element).getPropertyValue('--mds-text-animation-speed'));

    expect(speed(value(item))).toBe(0.15);
    expect(speed(item.shadowRoot!.querySelector('.description')!)).toBe(0.15);
  });
});
