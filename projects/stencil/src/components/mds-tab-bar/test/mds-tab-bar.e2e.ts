import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-tab-bar', () => {
  beforeEach(mockIconFetch);

  it('renders', async () => {
    const { root } = await render('<mds-tab-bar></mds-tab-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #827: the bar overwrote the ids of its items with `mds-tab-bar-item-N`, and their event
  // reported that value instead of the one the author wrote
  describe('the ids of the items', () => {
    it('stay as the author wrote them, and the events report them', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(`
        <mds-tab-bar>
          <mds-tab-bar-item id="tab-home" icon="mdi/home" label="Home" selected></mds-tab-bar-item>
          <mds-tab-bar-item id="tab-search" icon="mdi/magnify" label="Cerca"></mds-tab-bar-item>
        </mds-tab-bar>`);
      const [home, search] = Array.from(root.querySelectorAll('mds-tab-bar-item'));
      const select = spyOnEvent('mdsTabBarItemSelect');
      const change = spyOnEvent('mdsTabBarChange');

      search.click();
      await waitForChanges();

      expect(home.id).toBe('tab-home');
      expect(search.id).toBe('tab-search');
      expect(select.lastEvent?.detail).toBe('tab-search');
      expect(change.lastEvent?.detail.index).toBe(1);
      expect(search.selected).toBe(true);
      expect(home.selected).toBe(false);
    });

    it('are given to the items without one, by position, as before', async () => {
      const { root } = await render(`
        <mds-tab-bar>
          <mds-tab-bar-item id="tab-home" label="Home"></mds-tab-bar-item>
          <mds-tab-bar-item label="Cerca"></mds-tab-bar-item>
        </mds-tab-bar>`);

      expect(Array.from(root.querySelectorAll('mds-tab-bar-item'), (item) => item.id)).toEqual([
        'tab-home',
        'mds-tab-bar-item-1',
      ]);
    });
  });
});
