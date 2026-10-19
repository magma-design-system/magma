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

/** A computed style of an element once the transitions of the table have landed. */
const settledStyle = async (
  element: Element,
  property: 'backgroundColor' | 'borderBottomColor' | 'borderTopColor',
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  let previous = '';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const current = getComputedStyle(element)[property];
    if (current === previous) return current;
    previous = current;
  }
  return previous;
};

/** The background of an element once the transitions of the rows have landed. */
const settledBackground = (element: Element): Promise<string> =>
  settledStyle(element, 'backgroundColor');

describe('mds-table', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table></mds-table>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the rows', () => {
    const SELECTABLE = `
<mds-table interactive selectable>
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="uno"><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row value="due"><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-cell>Totale</mds-table-cell>
  </mds-table-footer>
</mds-table>`;

    it('paint a full colour at rest, the colour of the body', async () => {
      // a row at rest painted nothing and let through whatever lay under the table
      const { root, waitForChanges } = await render(SELECTABLE);
      // the tests share the page, and the pointer stays where the last one left it
      await userEvent.unhover(root);
      await waitForChanges();

      expect(await settledBackground(root.querySelector('mds-table-body mds-table-cell')!)).toBe(
        await settledBackground(root.querySelector('mds-table-body')!),
      );
    });

    it('never go through a transparent colour when the whole table is selected', async () => {
      // a selected row went from transparent to its colour, so halfway through the transition
      // its cells let the scroll area behind the table through, and the rows flickered
      const { root } = await render(SELECTABLE);
      const cell = root.querySelector('mds-table-body mds-table-cell')!;
      const seen: string[] = [];

      await (root as HTMLMdsTableElement).selectAll();
      for (let sample = 0; sample < 12; sample += 1) {
        seen.push(getComputedStyle(cell).backgroundColor);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      expect(seen.filter((colour) => colour.startsWith('rgba'))).toEqual([]);
    });

    it('paint the footer with the colour of the table, not the scroll area behind it', async () => {
      const { root } = await render(SELECTABLE);
      const wrapper = root.shadowRoot!.querySelector('.table-wrapper')!;
      const footerCell = root.querySelector('mds-table-footer mds-table-cell')!;

      expect(await settledBackground(footerCell)).not.toBe(await settledBackground(wrapper));
      expect(await settledBackground(footerCell)).toBe(
        await settledBackground(root.querySelector('mds-table-header-cell')!),
      );
    });
  });

  describe('the select-all cell of the header', () => {
    it('keeps the colour of the header while the pointer is on the body', async () => {
      // the cell is an mds-table-cell, which paints the background of its row: no row sets it
      // in the header, so it was transparent and showed the scroll area behind the table
      const { root, waitForChanges } = await render(`
<mds-table interactive selectable>
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="uno"><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row value="due"><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
  </mds-table-body>
</mds-table>`);

      await userEvent.hover(root.querySelector('mds-table-body mds-table-cell')!);
      await waitForChanges();

      const selection = root
        .querySelector('mds-table-header')!
        .shadowRoot!.querySelector('.selection')!;
      const wrapper = root.shadowRoot!.querySelector('.table-wrapper')!;
      expect(await settledBackground(wrapper)).not.toBe(
        await settledBackground(root.querySelector('mds-table-header-cell')!),
      );
      expect(await settledBackground(selection)).toBe(
        await settledBackground(root.querySelector('mds-table-header-cell')!),
      );
    });
  });

  describe('the lines of the table', () => {
    it('draws the frame with the border colour and the lines inside with the separator colour', async () => {
      // frame and grid shared --mds-table-border-color: the grid is decorative (border-muted),
      // the frame an outline (border-default), so each has its own property
      const { root } = await render(`
<mds-table style="--mds-table-border-color: rgb(10, 20, 30); --mds-table-separator-color: rgb(40, 50, 60)">
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
  </mds-table-body>
</mds-table>`);

      expect(await settledStyle(root, 'borderTopColor')).toBe('rgb(10, 20, 30)');
      expect(
        await settledStyle(root.querySelector('mds-table-header-cell')!, 'borderBottomColor'),
      ).toBe('rgb(40, 50, 60)');
      expect(
        await settledStyle(
          root.querySelector('mds-table-row mds-table-cell')!,
          'borderBottomColor',
        ),
      ).toBe('rgb(40, 50, 60)');
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

  // #826: whether the table has batch actions was read once, on load: buttons added later, when
  // the page fills the table, never got the bar
  describe('the batch actions bar', () => {
    const bar = (root: HTMLElement): Element | null =>
      root.shadowRoot!.querySelector('.batch-actions-wrapper');

    it('shows for a button added after load, and goes with the last one', async () => {
      const { root } = await render(
        TABLE.replace(/\s*<mds-button slot="batch-action"[^>]*><\/mds-button>/, ''),
      );
      expect(bar(root)).toBeNull();

      const button = document.createElement('mds-button');
      button.slot = 'batch-action';
      button.label = 'Archive';
      root.appendChild(button);
      await vi.waitFor(() => expect(bar(root)).not.toBeNull());

      button.remove();
      await vi.waitFor(() => expect(bar(root)).toBeNull());
    });
  });

  // #801: the header read the actions once, on load, so a table filled after its first render
  // (an empty array, then a fetch) had rows one cell longer than the header
  describe('actions that arrive after the first load', () => {
    const EMPTY = `
<mds-table>
  <mds-table-header>
    <mds-table-header-cell label="Document"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body></mds-table-body>
</mds-table>`;

    const headerActions = (root: HTMLElement): Element | null =>
      root
        .querySelector('mds-table-header')!
        .shadowRoot!.querySelector('mds-table-header-cell.actions');

    const row = (title: string, withAction = true): string =>
      `<mds-table-row><mds-table-cell>${title}</mds-table-cell>${
        withAction ? '<mds-button slot="action" label="Open"></mds-button>' : ''
      }</mds-table-row>`;

    it('shows the Actions column when rows with actions fill an empty body, and hides it when they go', async () => {
      const { root } = await render(EMPTY);
      const body = root.querySelector('mds-table-body')!;
      expect(headerActions(root)).toBeNull();

      body.insertAdjacentHTML('beforeend', row('One') + row('Two'));
      await vi.waitFor(() => expect(headerActions(root)).not.toBeNull());

      body.replaceChildren();
      await vi.waitFor(() => expect(headerActions(root)).toBeNull());
    });

    it('shows it when a row already on the page gets its actions later, and hides it when they go', async () => {
      const { root } = await render(
        EMPTY.replace(
          '<mds-table-body></mds-table-body>',
          `<mds-table-body>${row('One', false)}</mds-table-body>`,
        ),
      );
      const tableRow = root.querySelector('mds-table-row')!;
      await vi.waitFor(() => expect(tableRow).toHaveAttribute('hydrated'));
      expect(headerActions(root)).toBeNull();

      tableRow.insertAdjacentHTML(
        'beforeend',
        '<mds-button slot="action" label="Open"></mds-button>',
      );
      await vi.waitFor(() => expect(headerActions(root)).not.toBeNull());

      tableRow.querySelector('[slot="action"]')!.remove();
      await vi.waitFor(() => expect(headerActions(root)).toBeNull());
    });

    it('lays the actions over rows that came later, when the table is narrower than its cells', async () => {
      const { root } = await render(`<div style="width: 200px">${EMPTY}</div>`);
      const body = root.querySelector('mds-table-body')!;
      const wide = '<div style="width: 180px">wide</div>';

      body.insertAdjacentHTML(
        'beforeend',
        `<mds-table-row><mds-table-cell>${wide}</mds-table-cell><mds-table-cell>${wide}</mds-table-cell><mds-button slot="action" label="Open"></mds-button></mds-table-row>`,
      );
      const tableRow = root.querySelector('mds-table-row')!;
      await vi.waitFor(() => expect(tableRow.overlayActions).toBe(true));
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
