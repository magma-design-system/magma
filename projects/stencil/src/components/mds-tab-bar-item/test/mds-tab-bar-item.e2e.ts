import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';

describe('mds-tab-bar-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab-bar-item></mds-tab-bar-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  itReadsTheSlottedLabelWhenLabelIsNull('mds-tab-bar-item');

  // the items had no tab stop and no role, and a click on the selected item flipped an inner
  // state, so every other click on it emitted nothing (#820)
  describe('in a tab bar', () => {
    const bar = async () => {
      const rendered = await render(
        `<mds-tab-bar>
           <mds-tab-bar-item label="Home" selected></mds-tab-bar-item>
           <mds-tab-bar-item label="Search"></mds-tab-bar-item>
         </mds-tab-bar>`,
      );
      const items = Array.from(rendered.root.querySelectorAll('mds-tab-bar-item'));
      return { ...rendered, items };
    };

    it('makes every item a button in the tab order, the selected one current', async () => {
      const { items } = await bar();

      expect(items[0]).toEqualAttributes({ role: 'button', tabindex: '0', 'aria-current': 'true' });
      expect(items[1]).toEqualAttributes({ role: 'button', tabindex: '0' });
      expect(items[1]).not.toHaveAttribute('aria-current');
    });

    it('selects an item with Enter and with Space', async () => {
      const { items, spyOnEvent, waitForChanges } = await bar();
      const change = spyOnEvent('mdsTabBarChange');

      items[1].focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();
      expect(change.lastEvent?.detail).toEqual({ index: 1 });
      expect(items[1]).toEqualAttribute('aria-current', 'true');
      expect(items[0]).not.toHaveAttribute('selected');

      items[0].focus();
      await userEvent.keyboard('{Space}');
      await waitForChanges();
      expect(change.lastEvent?.detail).toEqual({ index: 0 });
      expect(change).toHaveReceivedEventTimes(2);
    });

    it('keeps the selected item selected and silent when it is clicked again', async () => {
      const { items, spyOnEvent, waitForChanges } = await bar();
      const select = spyOnEvent('mdsTabBarItemSelect');

      items[0].click();
      await waitForChanges();
      items[0].click();
      await waitForChanges();

      expect(select).not.toHaveReceivedEvent();
      expect(items[0]).toHaveAttribute('selected');
    });
  });
});
