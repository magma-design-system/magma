import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

const trail = (style: string, selected = 1): string => `
  <mds-breadcrumb style="${style}">
    <mds-breadcrumb-item label="Home"${selected === 0 ? ' selected' : ''}></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Archivio"${selected === 1 ? ' selected' : ''}></mds-breadcrumb-item>
  </mds-breadcrumb>`;

// the buttons fade their colours: read them once the transition is over
const settled = async (element: Element): Promise<void> => {
  await Promise.all(
    element
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );
};

const buttonOf = (item: Element): HTMLElement =>
  item.shadowRoot!.querySelector<HTMLElement>('mds-button')!;

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb></mds-breadcrumb>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('custom properties', () => {
    it('paints the selected item with the colours set on the breadcrumb', async () => {
      const { root } = await render(
        trail(
          '--mds-breadcrumb-button-color-selected: rgb(1 2 3); --mds-breadcrumb-button-background-selected: rgb(4 5 6)',
        ),
      );
      const [home, archive] = root.querySelectorAll('mds-breadcrumb-item');
      await settled(buttonOf(home));
      await settled(buttonOf(archive));

      expect(getComputedStyle(buttonOf(archive)).color).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(buttonOf(archive)).backgroundColor).toBe('rgb(4, 5, 6)');
      expect(getComputedStyle(buttonOf(home)).color).not.toBe('rgb(1, 2, 3)');
    });

    it.each([
      ['--mds-breadcrumb-button-color-current', 'rgb(7, 8, 9)'],
      ['--mds-breadcrumb-current-button-color', 'rgb(10, 11, 12)'],
    ])('still reads the deprecated %s', async (name, colour) => {
      const { root } = await render(trail(`${name}: ${colour}`));
      const selected = buttonOf(root.querySelector('mds-breadcrumb-item[selected]')!);
      await settled(selected);

      expect(getComputedStyle(selected).color).toBe(colour);
    });

    it('gives the disabled back button its background', async () => {
      const { root } = await render(
        trail('--mds-breadcrumb-button-background-disabled: rgb(13 14 15)', 0),
      );
      const back = root.shadowRoot!.querySelector<HTMLElement>('.back')!;

      expect(back).toHaveAttribute('disabled');
      await settled(back);
      expect(getComputedStyle(back).backgroundColor).toBe('rgb(13, 14, 15)');
    });
  });

  // the keyboard drove the breadcrumb differently from the pointer: Enter on the selected item
  // deselected it and left nothing selected, and the back button took Enter twice (#820)
  describe('the keyboard', () => {
    const trail = async () => {
      const rendered = await render(
        `<mds-breadcrumb>
           <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
           <mds-breadcrumb-item label="Section"></mds-breadcrumb-item>
           <mds-breadcrumb-item label="Page" selected></mds-breadcrumb-item>
         </mds-breadcrumb>`,
      );
      const items = Array.from(rendered.root.querySelectorAll('mds-breadcrumb-item'));
      const button = (item: HTMLElement) =>
        item.shadowRoot!.querySelector<HTMLElement>('mds-button')!;
      const back = rendered.root.shadowRoot!.querySelector<HTMLElement>('.back')!;
      return { ...rendered, items, button, back };
    };

    it('leaves the selected item selected on Enter, and says it is the current page', async () => {
      const { items, button, spyOnEvent, waitForChanges } = await trail();
      const change = spyOnEvent('mdsBreadcrumbChange');

      expect(button(items[2])).toEqualAttribute('aria-current', 'page');
      button(items[2]).focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Space}');
      await waitForChanges();

      expect(change).not.toHaveReceivedEvent();
      expect(items[2]).toHaveAttribute('selected');
    });

    it('selects an earlier item on Enter', async () => {
      const { items, button, spyOnEvent, waitForChanges } = await trail();
      const change = spyOnEvent('mdsBreadcrumbChange');

      button(items[0]).focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(change).toHaveReceivedEventTimes(1);
      expect(change.lastEvent?.detail.id).toBe('0');
      expect(items[0]).toHaveAttribute('selected');
      expect(items[2]).not.toHaveAttribute('selected');
      expect(button(items[2])).not.toHaveAttribute('aria-current');
    });

    it('goes back one level on Enter on the back button', async () => {
      const { items, back, spyOnEvent, waitForChanges } = await trail();
      const change = spyOnEvent('mdsBreadcrumbChange');

      back.focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(change).toHaveReceivedEventTimes(1);
      expect(change.lastEvent?.detail.id).toBe('1');
      expect(items[1]).toHaveAttribute('selected');
    });
  });

  // #827: the breadcrumb overwrote the ids of its items with `item-N`, and read the position of
  // the selected item back from that id
  describe('the ids of the items', () => {
    beforeEach(mockIconFetch);

    const TRAIL = `
      <mds-breadcrumb>
        <mds-breadcrumb-item id="home" label="Home"></mds-breadcrumb-item>
        <mds-breadcrumb-item id="docs" label="Documenti"></mds-breadcrumb-item>
        <mds-breadcrumb-item id="page" label="Pagina"></mds-breadcrumb-item>
      </mds-breadcrumb>`;

    it('stay as the author wrote them, and the selection goes by position', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(TRAIL);
      const items = Array.from(root.querySelectorAll('mds-breadcrumb-item'));
      const change = spyOnEvent('mdsBreadcrumbChange');

      items[2].shadowRoot!.querySelector<HTMLElement>('mds-button')!.click();
      await waitForChanges();

      expect(items.map((item) => item.id)).toEqual(['home', 'docs', 'page']);
      expect(items[2].selected).toBe(true);
      expect(change.lastEvent?.detail.id).toBe('2');

      // the back arrow read the position from the id: with the author's ids it selected nothing
      root.shadowRoot!.querySelector<HTMLElement>('.back')!.click();
      await waitForChanges();

      await vi.waitFor(() =>
        expect(items.map((item) => !!item.selected)).toEqual([false, true, false]),
      );
      expect(change.lastEvent?.detail.id).toBe('1');
    });

    it('are given to the items without one, by position, as before', async () => {
      const { root } = await render(`
        <mds-breadcrumb>
          <mds-breadcrumb-item id="home" label="Home"></mds-breadcrumb-item>
          <mds-breadcrumb-item label="Documenti"></mds-breadcrumb-item>
        </mds-breadcrumb>`);

      expect(Array.from(root.querySelectorAll('mds-breadcrumb-item'), (item) => item.id)).toEqual([
        'home',
        'item-1',
      ]);
    });
  });
});
