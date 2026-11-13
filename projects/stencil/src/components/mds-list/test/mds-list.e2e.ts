import { render } from '@stencil/vitest';
import { page } from 'vitest/browser';

const itemsOf = (list: Element): HTMLMdsListItemElement[] =>
  Array.from(list.querySelectorAll('mds-list-item'));

const hasMarker = (item: HTMLMdsListItemElement): boolean =>
  item.shadowRoot!.querySelector('mds-icon') !== null &&
  item.shadowRoot!.querySelector('mds-text') !== null;

describe('mds-list', () => {
  it('draws a dot before the text of each item by default, indented', async () => {
    const { root } = await render<HTMLMdsListElement>(
      '<mds-list><mds-list-item>Pane</mds-list-item><mds-list-item>Acqua</mds-list-item></mds-list>',
    );

    expect(root).toEqualAttribute('marker', 'dot');
    expect(itemsOf(root).every(hasMarker)).toBe(true);
    expect(getComputedStyle(root).paddingLeft).not.toBe('0px');
  });

  // a list of links, cards or chips: the items take any content and the page lays them out (#1408)
  describe('with marker none', () => {
    const links = `<mds-list marker="none">
      <mds-list-item><mds-link href="#components">Components</mds-link></mds-list-item>
      <mds-list-item><mds-link href="#tokens">Tokens</mds-link></mds-list-item>
    </mds-list>`;

    it('draws no marker and wraps the content in nothing: the slot alone, not indented', async () => {
      const { root } = await render<HTMLMdsListElement>(links);

      for (const item of itemsOf(root)) {
        expect(hasMarker(item)).toBe(false);
        expect(Array.from(item.shadowRoot!.children).map((child) => child.tagName)).toEqual([
          'SLOT',
        ]);
      }
      expect(getComputedStyle(root).paddingLeft).toBe('0px');
    });

    it('keeps the list and its items for the assistive technology, the links inside them', async () => {
      await render(links);

      await expect.element(page.getByRole('list')).toBeInTheDocument();
      expect(page.getByRole('listitem').all()).toHaveLength(2);
      await expect.element(page.getByRole('link', { name: 'Tokens' })).toBeInTheDocument();
    });

    it('lets the classes of the list lay the items out, as wide as their content', async () => {
      const { root } = await render<HTMLMdsListElement>(
        `<div style="width: 640px">
          <mds-list marker="none" style="display: flex; flex-wrap: wrap; gap: 8px">
            <mds-list-item><mds-chip label="Claude"></mds-chip></mds-list-item>
            <mds-list-item><mds-chip label="Cursor"></mds-chip></mds-list-item>
          </mds-list>
        </div>`,
      );
      const [first, second] = itemsOf(root);

      expect(getComputedStyle(first).display).toBe('block');
      // side by side on one row: the item is no longer as wide as the list
      expect(first.getBoundingClientRect().width).toBeLessThan(320);
      expect(second.getBoundingClientRect().top).toBe(first.getBoundingClientRect().top);
    });

    it('leaves out the icon and the typography of the item, which the content brings', async () => {
      const { root } = await render<HTMLMdsListElement>(
        '<mds-list marker="none"><mds-list-item icon="mi/baseline/star" typography="paragraph">Pane</mds-list-item></mds-list>',
      );

      expect(hasMarker(itemsOf(root)[0])).toBe(false);
    });
  });

  describe('the marker over time', () => {
    it('renders the items again when the marker of the list changes', async () => {
      const { root, waitForChanges } = await render<HTMLMdsListElement>(
        '<mds-list><mds-list-item>Pane</mds-list-item><mds-list-item>Acqua</mds-list-item></mds-list>',
      );

      root.marker = 'none';
      await waitForChanges();
      expect(itemsOf(root).some(hasMarker)).toBe(false);

      root.marker = 'dot';
      await waitForChanges();
      expect(itemsOf(root).every(hasMarker)).toBe(true);
      expect(itemsOf(root)[0]).not.toHaveAttribute('list-marker');
    });

    it('gives an item added later the marker of its list', async () => {
      const { root, waitForChanges } = await render<HTMLMdsListElement>(
        '<mds-list marker="none"><mds-list-item>Pane</mds-list-item></mds-list>',
      );
      const item = document.createElement('mds-list-item');
      item.textContent = 'Acqua';

      root.append(item);
      await waitForChanges();
      await item.componentOnReady();

      expect(hasMarker(item)).toBe(false);
    });

    it('gives an item moved into another list the marker of that list', async () => {
      const { root, waitForChanges } = await render(
        `<div>
          <mds-list id="dots"><mds-list-item>Pane</mds-list-item></mds-list>
          <mds-list id="bare" marker="none"></mds-list>
        </div>`,
      );
      const item = root.querySelector<HTMLMdsListItemElement>('#dots mds-list-item')!;
      expect(hasMarker(item)).toBe(true);

      root.querySelector('#bare')!.append(item);
      await waitForChanges();

      expect(hasMarker(item)).toBe(false);
    });
  });
});
