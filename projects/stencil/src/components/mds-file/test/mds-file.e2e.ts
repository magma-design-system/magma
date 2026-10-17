import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const getText = (host: HTMLElement, selector: string): string | null =>
  host.shadowRoot!.querySelector(selector)?.textContent?.trim() ?? null;

describe('mds-file', () => {
  it('renders', async () => {
    const { root } = await render('<mds-file filename="report.pdf"></mds-file>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the name and the extension separately', async () => {
    const { root } = await render('<mds-file filename="report.pdf"></mds-file>');

    expect(getText(root, '.name')).toBe('report');
    expect(getText(root, '.extension')).toBe('.pdf');
    expect(getText(root, '.suffix')).toBe('pdf');
    expect(root).toEqualAttribute('format', 'document');
  });

  // #747: the name was cut at the first dot, dropping everything up to the extension
  it('splits the name and the extension at the last dot', async () => {
    const { root } = await render(
      '<mds-file filename="Delibera n. 12.2024 finale.pdf"></mds-file>',
    );

    expect(getText(root, '.name')).toBe('Delibera n. 12.2024 finale');
    expect(getText(root, '.extension')).toBe('.pdf');
    expect(getText(root, '.suffix')).toBe('pdf');
    expect(root).toEqualAttribute('format', 'document');
  });

  it('keeps the dots of the name when suffix overrides the extension', async () => {
    const { root } = await render(
      '<mds-file filename="report.v2.final.docx" suffix="pdf"></mds-file>',
    );

    expect(getText(root, '.name')).toBe('report.v2.final');
    expect(getText(root, '.extension')).toBeNull();
    expect(getText(root, '.suffix')).toBe('pdf');
    expect(root).toEqualAttribute('format', 'document');
  });

  it('updates the name and the extension when filename changes', async () => {
    const { root, waitForChanges } = await render(
      '<mds-file filename="archive.tar.gz"></mds-file>',
    );

    expect(getText(root, '.name')).toBe('archive.tar');
    expect(getText(root, '.extension')).toBe('.gz');

    root.setAttribute('filename', 'report.v2.final.docx');
    await waitForChanges();

    expect(getText(root, '.name')).toBe('report.v2.final');
    expect(getText(root, '.extension')).toBe('.docx');
    expect(root).toEqualAttribute('format', 'text');
  });

  it('shows no extension and no badge for a filename without one', async () => {
    const { root } = await render('<mds-file filename="verbale"></mds-file>');

    expect(getText(root, '.name')).toBe('verbale');
    expect(getText(root, '.extension')).toBeNull();
    expect(getText(root, '.suffix')).toBeNull();
  });
});

describe('mds-file downloaded indicator', () => {
  const indicator = (host: HTMLElement): Element | null =>
    host.shadowRoot!.querySelector('.indicator .downloaded');

  // the keys the component builds: `mdsFile/` plus the FNV-1a hash of the filename. Literal on
  // purpose: a change of the hash silently forgets every download the visitors recorded so far
  const REPORT_KEY = 'mdsFile/9ba50147';
  const OTHER_KEY = 'mdsFile/4fd11d19';

  // #940: a small in-house hash of the filename as the key, instead of the crypto-js MD5
  it('records the click in localStorage under the hash of the filename', async () => {
    const { root, waitForChanges } = await render('<mds-file filename="report.pdf"></mds-file>');
    expect(indicator(root)).toBeNull();

    await userEvent.click(root);
    await waitForChanges();

    expect(indicator(root)).not.toBeNull();
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem(REPORT_KEY)).toBe('downloaded');
  });

  // #830: it wrote `mdsFile<hash>` and read `mdsFile/<hash>`, so the indicator never came back
  it('shows the indicator from the first paint of a filename downloaded before', async () => {
    const first = await render('<mds-file filename="report.pdf"></mds-file>');
    await userEvent.click(first.root);
    await first.waitForChanges();
    expect(indicator(first.root)).not.toBeNull();

    const again = await render('<mds-file filename="report.pdf"></mds-file>');
    expect(indicator(again.root)).not.toBeNull();

    const other = await render('<mds-file filename="other.pdf"></mds-file>');
    expect(indicator(other.root)).toBeNull();
    expect(localStorage.getItem(OTHER_KEY)).toBeNull();
  });

  it('hides the indicator with hide-downloaded-icon', async () => {
    localStorage.setItem(REPORT_KEY, 'downloaded');

    const { root } = await render(
      '<mds-file filename="report.pdf" hide-downloaded-icon></mds-file>',
    );

    expect(indicator(root)).toBeNull();
  });

  it('follows the filename', async () => {
    localStorage.setItem(REPORT_KEY, 'downloaded');
    const { root, waitForChanges } = await render('<mds-file filename="other.pdf"></mds-file>');
    expect(indicator(root)).toBeNull();

    root.setAttribute('filename', 'report.pdf');
    await waitForChanges();
    expect(indicator(root)).not.toBeNull();

    root.setAttribute('filename', 'other.pdf');
    await waitForChanges();
    expect(indicator(root)).toBeNull();
  });
});
