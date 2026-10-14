import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const strip = `<mds-tab>
  <mds-tab-item label="First" selected></mds-tab-item>
  <mds-tab-item label="Second"></mds-tab-item>
</mds-tab>`;

const links = `<mds-tab>
  <mds-tab-item href="#a" label="A" selected></mds-tab-item>
  <mds-tab-item href="#b" label="B"></mds-tab-item>
</mds-tab>`;

const panel = (text: string): HTMLElement => {
  const element = document.createElement('div');
  element.slot = 'content';
  element.textContent = text;
  return element;
};

const linkItem = (href: string): HTMLMdsTabItemElement => {
  const item = document.createElement('mds-tab-item');
  item.href = href;
  item.label = href;
  return item;
};

describe('mds-tab', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab></mds-tab>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the strip alone, the page showing the content: by navigation (href on the items) or from
  // the mdsTabChange event
  describe('without content panels', () => {
    it('hides the area of the contents', async () => {
      const { root } = await render(strip);

      expect(getComputedStyle(root.shadowRoot!.querySelector('.contents')!).display).toBe('none');
    });

    it('shows it as soon as a panel arrives', async () => {
      const { root } = await render(strip);
      const contents = root.shadowRoot!.querySelector('.contents')!;
      const first = panel('First');

      root.appendChild(first);

      await vi.waitFor(() => expect(getComputedStyle(contents).display).not.toBe('none'));
      expect(first).toEqualAttribute('role', 'tabpanel');
    });

    it('still selects the tab that is clicked, and says so once', async () => {
      const { root, spyOnEvent } = await render(strip);
      const change = spyOnEvent('mdsTabChange');
      const [first, second] = Array.from(root.querySelectorAll('mds-tab-item'));

      await userEvent.click(second.shadowRoot!.querySelector('mds-button')!);

      await vi.waitFor(() => expect(second).toHaveAttribute('selected'));
      expect(first).not.toHaveAttribute('selected');
      // the page shows the content from this event: it used to come twice, the item announcing
      // its selection again when the parent handed `selected` back to it
      expect(change).toHaveReceivedEventTimes(1);
      expect(change.lastEvent?.detail).toMatchObject({ id: 1 });
    });

    it('spans the whole width in the vertical direction, leaving no column to the contents', async () => {
      const { root } = await render(strip.replace('<mds-tab>', '<mds-tab direction="vertical">'));
      const wrapper = root.shadowRoot!.querySelector('.tabs-wrapper')!;

      // the host is a grid with a column for the contents: empty, it still took its share of
      // the width. The strip spans it too; the comparison allows the rounding of the layout
      const gap = root.getBoundingClientRect().right - wrapper.getBoundingClientRect().right;
      expect(Math.abs(gap) <= 1).toBe(true);
    });
  });

  describe('as a navigation, when every item is a link', () => {
    const tabs = (root: HTMLElement): Element => root.shadowRoot!.querySelector('.tabs')!;

    it('is no tablist: its items are links, not tabs', async () => {
      const { root } = await render(links);

      expect(tabs(root)).not.toHaveAttribute('role');
      expect(
        Array.from(root.querySelectorAll('mds-tab-item')).map((item) =>
          item.shadowRoot!.querySelector('mds-button')!.getAttribute('role'),
        ),
      ).toEqual(['link', 'link']);
    });

    it('stays a tablist while one item is a tab', async () => {
      const { root } = await render(
        links.replace('<mds-tab-item href="#b" label="B">', '<mds-tab-item label="B">'),
      );

      expect(tabs(root)).toEqualAttribute('role', 'tablist');
    });

    it('follows the items that arrive later', async () => {
      const { root } = await render('<mds-tab></mds-tab>');
      expect(tabs(root)).toEqualAttribute('role', 'tablist');

      root.appendChild(linkItem('#a'));
      root.appendChild(linkItem('#b'));

      await vi.waitFor(() => expect(tabs(root)).not.toHaveAttribute('role'));
    });
  });
});
