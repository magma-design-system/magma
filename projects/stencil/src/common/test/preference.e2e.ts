import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

/**
 * Covers the store sync from `<html>`: external writers touching `lang` or the
 * `pref-*` classes directly (no mds-pref-* controller involved) must reach every
 * consumer through the MutationObserver path.
 */
describe('preference store (sync from <html>)', () => {
  const closeButtonTitle = (note: HTMLElement): string | null =>
    note.shadowRoot!.querySelector('mds-button.button-close')!.getAttribute('title');

  it('updates localized texts when <html lang> changes', async () => {
    const { root, waitForChanges } = await render('<mds-note deletable></mds-note>');
    expect(closeButtonTitle(root)).toBe('Remove');

    document.documentElement.setAttribute('lang', 'it');
    await waitForChanges();

    expect(closeButtonTitle(root)).toBe('Rimuovi');
  });

  it('falls back to the rollback language for unsupported languages', async () => {
    const { root, waitForChanges } = await render('<mds-note deletable></mds-note>');

    document.documentElement.setAttribute('lang', 'fr');
    await waitForChanges();

    expect(closeButtonTitle(root)).toBe('Remove');
  });

  it('reflects pref-* classes published on <html> onto consumer hosts', async () => {
    const { root, waitForChanges } = await render('<mds-note></mds-note>');
    expect(root.getAttribute('pref-theme')).toBeNull();

    document.documentElement.classList.add('pref-theme-dark');
    await waitForChanges();

    expect(root.getAttribute('pref-theme')).toBe('dark');
  });

  it('propagates the contrast selected on mds-pref-contrast to every consumer', async () => {
    const { root, waitForChanges } = await render(
      '<mds-pref-contrast></mds-pref-contrast><mds-note></mds-note>',
    );
    const note = root.nextElementSibling!;

    const moreItem = root.shadowRoot!.querySelector<HTMLElement>('mds-tab-item.item--more')!;
    await userEvent.click(moreItem);
    await waitForChanges();

    // the controller host, its shadow items and external consumers all reflect the value
    expect(root.getAttribute('pref-contrast')).toBe('more');
    expect(moreItem.getAttribute('pref-contrast')).toBe('more');
    expect(note.getAttribute('pref-contrast')).toBe('more');
  });
});
