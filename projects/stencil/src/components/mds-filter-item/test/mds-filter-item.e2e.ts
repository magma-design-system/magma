import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';
import { useLanguage } from '@test/language';

const filter = (items: string) =>
  render(`<mds-filter label="Stato">${items}</mds-filter>`).then((rendered) => ({
    ...rendered,
    items: Array.from(rendered.root.querySelectorAll('mds-filter-item')),
  }));

describe('mds-filter-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-filter-item></mds-filter-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #941: the selection was shown to the eye only, on a menu item that promised a menu
  describe('as a toggle button', () => {
    it('is a button whose pressed state follows selected', async () => {
      const { items, waitForChanges } = await filter(
        '<mds-filter-item label="Nuove" value="new"></mds-filter-item>' +
          '<mds-filter-item label="Chiuse" value="closed" selected></mds-filter-item>',
      );

      expect(items[0]).toEqualAttributes({ role: 'button', 'aria-pressed': 'false' });
      expect(items[1]).toEqualAttribute('aria-pressed', 'true');

      items[0].click();
      await waitForChanges();

      expect(items[0]).toEqualAttribute('aria-pressed', 'true');
      expect(items[1]).toEqualAttribute('aria-pressed', 'false');
    });

    it('toggles with Space as with Enter', async () => {
      const { items, waitForChanges } = await filter(
        '<mds-filter-item label="Nuove" value="new"></mds-filter-item>',
      );

      items[0].focus();
      await userEvent.keyboard('{Space}');
      await waitForChanges();
      expect(items[0].selected).toBe(true);

      await userEvent.keyboard('{Enter}');
      await waitForChanges();
      expect(items[0].selected).toBe(false);
    });

    it('does nothing when disabled, and says so', async () => {
      const { items, spyOnEvent, waitForChanges } = await filter(
        '<mds-filter-item label="Nuove" value="new" disabled></mds-filter-item>',
      );
      const select = spyOnEvent('mdsFilterItemSelect');

      items[0].click();
      await waitForChanges();

      expect(items[0].selected).toBeFalsy();
      expect(select).not.toHaveReceivedEvent();
      expect(items[0]).toEqualAttributes({ 'aria-disabled': 'true', tabindex: '-1' });
    });
  });

  describe('accessible name', () => {
    beforeEach(mockIconFetch);

    it('is the label followed by the count, as a number of results', async () => {
      const { items } = await filter(
        '<mds-filter-item label="Nuove" value="new" count="11"></mds-filter-item>' +
          '<mds-filter-item label="Chiuse" value="closed" count="1"></mds-filter-item>' +
          '<mds-filter-item label="Tutte" value="all"></mds-filter-item>',
      );

      expect(items[0]).toEqualAttribute('aria-label', 'Nuove, 11 results');
      expect(items[1]).toEqualAttribute('aria-label', 'Chiuse, 1 result');
      expect(items[2]).toEqualAttribute('aria-label', 'Tutte');
    });

    it('follows the count when it changes', async () => {
      const { items, waitForChanges } = await filter(
        '<mds-filter-item label="Nuove" value="new" count="11"></mds-filter-item>',
      );

      items[0].count = '4';
      await waitForChanges();

      expect(items[0]).toEqualAttribute('aria-label', 'Nuove, 4 results');
    });

    it('is the icon slug for an icon-only item', async () => {
      const { items } = await filter(
        '<mds-filter-item icon="mi/baseline/grid-view" value="grid"></mds-filter-item>',
      );

      expect(items[0]).toEqualAttribute('aria-label', 'grid view');
    });

    it('keeps an aria-label written by the author', async () => {
      const { items, waitForChanges } = await filter(
        '<mds-filter-item aria-label="Vista a griglia" icon="mi/baseline/grid-view" value="grid" count="3"></mds-filter-item>',
      );

      expect(items[0]).toEqualAttribute('aria-label', 'Vista a griglia');

      items[0].count = '5';
      await waitForChanges();

      expect(items[0]).toEqualAttribute('aria-label', 'Vista a griglia');
    });

    describe('in another language', () => {
      useLanguage('it');

      it('translates the number of results', async () => {
        const { items } = await filter(
          '<mds-filter-item label="Nuove" value="new" count="11"></mds-filter-item>' +
            '<mds-filter-item label="Chiuse" value="closed" count="1"></mds-filter-item>',
        );

        expect(items[0]).toEqualAttribute('aria-label', 'Nuove, 11 risultati');
        expect(items[1]).toEqualAttribute('aria-label', 'Chiuse, 1 risultato');
      });
    });
  });
});
