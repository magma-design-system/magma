import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb></mds-breadcrumb>');

    expect(root).toHaveAttribute('hydrated');
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
});
