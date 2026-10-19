import { render, vi } from '@stencil/vitest';

describe('mds-accordion-timer', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer></mds-accordion-timer>');

    expect(root).toHaveAttribute('hydrated');
  });

  // a click or an advance selected the item twice: two mdsAccordionTimerChange each, and a click
  // on the open item closed it, stopping the rotation (#823)
  describe('the selection', () => {
    const stage = async (duration: number) => {
      // out of the way of the pointer: one resting over the open item pauses the rotation
      const rendered = await render(`
        <mds-accordion-timer duration="${duration}" style="position: fixed; top: -2000px">
          <mds-accordion-timer-item description="Uno" selected>Primo</mds-accordion-timer-item>
          <mds-accordion-timer-item description="Due">Secondo</mds-accordion-timer-item>
        </mds-accordion-timer>`);
      const items = Array.from(rendered.root.querySelectorAll('mds-accordion-timer-item'));
      const changes: number[] = [];
      rendered.root.addEventListener('mdsAccordionTimerChange', (event) =>
        changes.push((event as CustomEvent<{ index: number }>).detail.index),
      );
      const header = (item: Element) =>
        item.shadowRoot!.querySelector<HTMLElement>('button.action')!;
      return { ...rendered, items, changes, header };
    };

    it('announces a click once', async () => {
      const { items, changes, header, waitForChanges } = await stage(60000);

      header(items[1]).click();
      await waitForChanges();

      expect(changes).toEqual([1]);
      expect(items[1]).toHaveAttribute('selected');
      expect(items[0]).not.toHaveAttribute('selected');
    });

    it('announces an advance of the rotation once', async () => {
      const { changes } = await stage(500);

      await vi.waitFor(() => expect(changes.length).toBeGreaterThan(0), { timeout: 3000 });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(changes).toEqual([1]);
    });

    it('keeps the open item open when it is clicked', async () => {
      const { items, changes, header, waitForChanges } = await stage(60000);

      header(items[0]).click();
      await waitForChanges();

      expect(items[0]).toHaveAttribute('selected');
      expect(changes).toEqual([]);
    });
  });
});
