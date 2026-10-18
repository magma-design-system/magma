import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-accordion', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion></mds-accordion>');

    expect(root).toHaveAttribute('hydrated');
  });

  const setup = async (attributes: string) => {
    const { root, waitForChanges } = await render(`
      <mds-accordion ${attributes}>
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`);
    const [item1, item2] = Array.from(root.querySelectorAll('mds-accordion-item'));
    // click the toggle button directly: the host center can land on the
    // content area while the expand/collapse height animation is running
    const click = async (item: HTMLElement): Promise<void> => {
      await userEvent.click(item.shadowRoot!.querySelector('button.action')!);
      await waitForChanges();
    };
    return { item1, item2, click };
  };

  it('multiple select', async () => {
    const { item1, item2, click } = await setup('multiple');

    await click(item1);
    await click(item2);

    expect(item1).toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');
  });

  it('should not be closable when disable-close is set', async () => {
    const { item1, item2, click } = await setup('disable-close');

    await click(item1);
    expect(item1).toHaveAttribute('selected');

    await click(item2);
    expect(item1).not.toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');

    // should not been closed
    await click(item2);
    expect(item2).toHaveAttribute('selected');
  });

  it('should keep at least one item open in multiple mode when disable-close is set', async () => {
    const { item1, item2, click } = await setup('multiple disable-close');

    await click(item1);
    await click(item2);
    expect(item1).toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');

    // closing one item while another stays open is allowed
    await click(item2);
    expect(item1).toHaveAttribute('selected');
    expect(item2).not.toHaveAttribute('selected');

    // closing the last open item is prevented
    await click(item1);
    expect(item1).toHaveAttribute('selected');
  });

  // #827: the accordion overwrote the ids of its items with `item-N`, and their events reported
  // that value instead of the one the author wrote
  describe('the ids of the items', () => {
    it('stay as the author wrote them, and the events report them', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(`
        <mds-accordion>
          <mds-accordion-item id="shipping" label="Spedizioni"></mds-accordion-item>
          <mds-accordion-item id="returns" label="Resi"></mds-accordion-item>
        </mds-accordion>`);
      const [shipping, returns] = Array.from(root.querySelectorAll('mds-accordion-item'));
      const select = spyOnEvent('mdsAccordionItemSelect');

      await userEvent.click(returns.shadowRoot!.querySelector('button.action')!);
      await waitForChanges();

      expect(shipping.id).toBe('shipping');
      expect(returns.id).toBe('returns');
      expect(select.lastEvent?.detail.id).toBe('returns');
      expect(returns).toHaveAttribute('selected');
      expect(shipping).not.toHaveAttribute('selected');
    });

    it('are given to the items without one, by position, as before', async () => {
      const { root } = await render(`
        <mds-accordion>
          <mds-accordion-item id="shipping" label="Spedizioni"></mds-accordion-item>
          <mds-accordion-item label="Resi"></mds-accordion-item>
        </mds-accordion>`);

      expect(Array.from(root.querySelectorAll('mds-accordion-item'), (item) => item.id)).toEqual([
        'shipping',
        'item-1',
      ]);
    });
  });
});
