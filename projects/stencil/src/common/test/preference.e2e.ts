import { newE2EPage } from '@stencil/core/testing';

/**
 * Covers the MutationObserver sync path: external writers touching `<html>`
 * directly (no mds-pref-* controller involved) must still reach the store.
 * The synchronous store path is covered by the spec tests.
 */
describe('preference store (MutationObserver sync from <html>)', () => {
  it('updates localized texts when <html lang> changes', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-note deletable></mds-note>');

    const closeButton = await page.find('mds-note >>> mds-button.button-close');
    expect(closeButton.getAttribute('title')).toBe('Remove');

    await page.evaluate(() => document.documentElement.setAttribute('lang', 'it'));
    await page.waitForChanges();

    const updatedButton = await page.find('mds-note >>> mds-button.button-close');
    expect(updatedButton.getAttribute('title')).toBe('Rimuovi');
  });

  it('reflects pref-* classes published on <html> onto consumer hosts', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-note></mds-note>');

    const note = await page.find('mds-note');
    expect(note.getAttribute('pref-theme')).toBeNull();

    await page.evaluate(() => document.documentElement.classList.add('pref-theme-dark'));
    await page.waitForChanges();

    const updatedNote = await page.find('mds-note');
    expect(updatedNote.getAttribute('pref-theme')).toBe('dark');
  });

  it('propagates the contrast selected on mds-pref-contrast to every consumer', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-pref-contrast></mds-pref-contrast><mds-note></mds-note>');
    await page.waitForChanges();

    const moreItem = await page.find('mds-pref-contrast >>> mds-tab-item.item--more');
    await moreItem.click();
    await page.waitForChanges();

    // the controller host, its shadow items and external consumers all reflect the value
    const pref = await page.find('mds-pref-contrast');
    const note = await page.find('mds-note');
    expect(pref.getAttribute('pref-contrast')).toBe('more');
    expect(moreItem.getAttribute('pref-contrast')).toBe('more');
    expect(note.getAttribute('pref-contrast')).toBe('more');
  });
});
