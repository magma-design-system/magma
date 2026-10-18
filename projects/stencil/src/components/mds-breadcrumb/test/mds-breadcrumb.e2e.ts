import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb></mds-breadcrumb>');

    expect(root).toHaveAttribute('hydrated');
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

// for the back arrow the caller was the item the step left, for a click the item it selects (#823)
describe('mds-breadcrumb change caller', () => {
  it('is the item the back arrow selects, as for a click', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(`
      <mds-breadcrumb>
        <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
        <mds-breadcrumb-item label="Section"></mds-breadcrumb-item>
        <mds-breadcrumb-item label="Page" selected></mds-breadcrumb-item>
      </mds-breadcrumb>`);
    const change = spyOnEvent('mdsBreadcrumbChange');
    const items = root.querySelectorAll('mds-breadcrumb-item');

    root.shadowRoot!.querySelector<HTMLElement>('.back')!.click();
    await waitForChanges();

    expect(change.lastEvent?.detail.id).toBe('1');
    expect(change.lastEvent?.detail.caller).toBe(items[1]);
  });
});
