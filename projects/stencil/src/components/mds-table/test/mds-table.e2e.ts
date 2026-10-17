import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

/** A selectable table with something in the batch-action slot: the counter only exists there. */
const TABLE = `
<mds-table selectable>
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="uno"><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row value="due"><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
    <mds-table-row value="tre"><mds-table-cell value="Tre">Tre</mds-table-cell></mds-table-row>
  </mds-table-body>
  <mds-button slot="batch-action" label="Remove"></mds-button>
</mds-table>`;

/** What the badge PAINTS, which is the point: its own copy of the number, not the light DOM. */
const counter = (root: HTMLElement): string =>
  root.shadowRoot!.querySelector('mds-badge')!.shadowRoot!.textContent!.trim();

const toggleRow = (root: HTMLElement, index: number): void => {
  const row = root.querySelectorAll('mds-table-row')[index];
  const input = row
    .shadowRoot!.querySelector('mds-input-switch')!
    .shadowRoot!.querySelector('input');
  input!.click();
};

describe('mds-table', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table></mds-table>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the scroll area', () => {
    const INTERACTIVE = `
<mds-table interactive>
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
  </mds-table-body>
</mds-table>`;

    /** The background of an element once the transitions of the rows have landed. */
    const settledBackground = async (element: Element): Promise<string> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let previous = '';
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const current = getComputedStyle(element).backgroundColor;
        if (current === previous) return current;
        previous = current;
      }
      return previous;
    };

    it('takes the colour of the rows that are not hovered while the pointer is on the body', async () => {
      // the wrapper shows where a trackpad bounces the table past its first or last column:
      // it kept the base colour, a white band next to the rows the hover had turned grey
      const { root, waitForChanges } = await render(INTERACTIVE);
      const [hovered, other] = Array.from(root.querySelectorAll('mds-table-cell'));

      await userEvent.hover(hovered);
      await waitForChanges();

      const wrapper = root.shadowRoot!.querySelector('.table-wrapper')!;
      expect(await settledBackground(other)).not.toBe(await settledBackground(hovered));
      expect(await settledBackground(wrapper)).toBe(await settledBackground(other));
    });

    it('keeps the colour of the rows while the pointer is away', async () => {
      const { root, waitForChanges } = await render(INTERACTIVE);
      // the tests share the page, and the pointer stays where the last one left it
      await userEvent.unhover(root);
      await waitForChanges();

      // at rest the rows paint nothing: what shows through them is the body
      const wrapper = root.shadowRoot!.querySelector('.table-wrapper')!;
      expect(await settledBackground(wrapper)).toBe(
        await settledBackground(root.querySelector('mds-table-body')!),
      );
    });
  });

  describe('the batch actions counter', () => {
    it('counts every selected row', async () => {
      // it used to arrive through the badge's deprecated slot, which is read once and
      // copied: the number moved in the light DOM and the badge kept painting 0
      const { root, waitForChanges } = await render(TABLE);

      expect(counter(root)).toBe('0');

      toggleRow(root, 0);
      await waitForChanges();
      expect(counter(root)).toBe('1');

      toggleRow(root, 2);
      await waitForChanges();
      expect(counter(root)).toBe('2');
    });

    it('counts back down when a row is unselected', async () => {
      const { root, waitForChanges } = await render(TABLE);

      toggleRow(root, 0);
      toggleRow(root, 1);
      await waitForChanges();
      expect(counter(root)).toBe('2');

      toggleRow(root, 1);
      await waitForChanges();
      expect(counter(root)).toBe('1');
    });

    it('follows selectAll() as well as the checkboxes', async () => {
      const { root, waitForChanges } = await render(TABLE);

      await (root as HTMLMdsTableElement).selectAll();
      await waitForChanges();
      expect(counter(root)).toBe('3');

      await (root as HTMLMdsTableElement).selectAll(false);
      await waitForChanges();
      expect(counter(root)).toBe('0');
    });
  });

  // only the checkbox told the table about a selection: a row selected from code was missing
  // from mdsTableSelectionChange until the next click (#823)
  describe('mdsTableSelectionChange', () => {
    const selections = (root: HTMLElement) => {
      const seen: string[][] = [];
      root.addEventListener('mdsTableSelectionChange', (event) =>
        seen.push(
          (event as CustomEvent<{ rows: { value: string }[] }>).detail.rows.map((row) => row.value),
        ),
      );
      return seen;
    };

    it('follows a row selected from code', async () => {
      const { root, waitForChanges } = await render(TABLE);
      const seen = selections(root);

      (root.querySelectorAll('mds-table-row')[1] as HTMLMdsTableRowElement).selected = true;
      await waitForChanges();

      expect(seen).toEqual([['due']]);
      expect(counter(root)).toBe('1');
    });

    it('announces a selection of every row once', async () => {
      const { root, waitForChanges } = await render<HTMLMdsTableElement>(TABLE);
      const seen = selections(root);

      await root.selectAll();
      await waitForChanges();

      expect(seen).toEqual([['uno', 'due', 'tre']]);
    });

    it('still announces a click on a checkbox, once', async () => {
      const { root, waitForChanges } = await render(TABLE);
      const seen = selections(root);

      toggleRow(root, 0);
      await waitForChanges();

      expect(seen).toEqual([['uno']]);
    });
  });
});

// disconnectedCallback took the scroll listener off the host, which never had it (#823)
describe('mds-table leaving the page', () => {
  it('takes the scroll listener off the wrapper it was added to', async () => {
    // the listener follows the actions of the rows: a table without them has none
    const { root } = await render(`
      <mds-table>
        <mds-table-body>
          <mds-table-row>
            <mds-table-cell>Uno</mds-table-cell>
            <mds-button slot="action" label="Apri"></mds-button>
          </mds-table-row>
        </mds-table-body>
      </mds-table>`);
    const wrapper = root.shadowRoot!.querySelector<HTMLElement>('.table-wrapper')!;
    const remove = vi.spyOn(wrapper, 'removeEventListener');

    root.remove();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
