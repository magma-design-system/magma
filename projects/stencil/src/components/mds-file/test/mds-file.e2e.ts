import { render } from '@stencil/vitest';

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
    expect(root).toHaveAttribute('format', 'document');
  });

  // #747: the name was cut at the first dot, dropping everything up to the extension
  it('splits the name and the extension at the last dot', async () => {
    const { root } = await render(
      '<mds-file filename="Delibera n. 12.2024 finale.pdf"></mds-file>',
    );

    expect(getText(root, '.name')).toBe('Delibera n. 12.2024 finale');
    expect(getText(root, '.extension')).toBe('.pdf');
    expect(getText(root, '.suffix')).toBe('pdf');
    expect(root).toHaveAttribute('format', 'document');
  });

  it('keeps the dots of the name when suffix overrides the extension', async () => {
    const { root } = await render(
      '<mds-file filename="report.v2.final.docx" suffix="pdf"></mds-file>',
    );

    expect(getText(root, '.name')).toBe('report.v2.final');
    expect(getText(root, '.extension')).toBeNull();
    expect(getText(root, '.suffix')).toBe('pdf');
    expect(root).toHaveAttribute('format', 'document');
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
    expect(root).toHaveAttribute('format', 'text');
  });
});
