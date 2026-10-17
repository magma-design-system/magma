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

  // closing the open item of a single accordion announced nothing, and a click that
  // disable-close turned down announced a change that did not happen (#823)
  describe('mdsAccordionChange', () => {
    const recorded = async (attributes: string) => {
      const rendered = await setup(attributes);
      const accordion = rendered.item1.closest('mds-accordion')!;
      const changes: string[] = [];
      accordion.addEventListener('mdsAccordionChange', (event) =>
        changes.push((event as CustomEvent<{ selected: string }>).detail.selected),
      );
      return { ...rendered, changes };
    };

    it('announces the closing of the open item, with nothing selected', async () => {
      const { item1, item2, click, changes } = await recorded('');

      await click(item1);
      await click(item2);
      await click(item2);

      expect(changes).toEqual(['0', '1', '']);
    });

    it('announces nothing when disable-close keeps the item open', async () => {
      const { item1, click, changes } = await recorded('disable-close');

      await click(item1);
      await click(item1);

      expect(changes).toEqual(['0']);
    });

    it('announces nothing when disable-close keeps the last item open in multiple mode', async () => {
      const { item1, item2, click, changes } = await recorded('multiple disable-close');

      await click(item1);
      await click(item2);
      await click(item2);
      await click(item1);

      expect(changes).toEqual(['0', '0,1', '0']);
    });
  });
});
