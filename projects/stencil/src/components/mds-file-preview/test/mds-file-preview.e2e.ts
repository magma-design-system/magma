import { render } from '@stencil/vitest';

describe('mds-file-preview', () => {
  it('renders', async () => {
    const { root } = await render('<mds-file-preview filename=""></mds-file-preview>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the unknown format fallback in the current language', async () => {
    document.documentElement.lang = 'it';
    const { root } = await render('<mds-file-preview filename=""></mds-file-preview>');

    expect(root).toEqualAttributes({ format: 'attachment', truncate: 'word' });

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.preview--icon mds-icon')).not.toBeNull();
    expect(shadow.querySelector('mds-text.file-name')).toEqualAttributes({
      truncate: 'word',
      typography: 'h6',
      variant: 'title',
    });

    const badge = shadow.querySelector('mds-badge.suffix')!;
    expect(badge).toEqualAttributes({
      title: 'Formato file sconosciuto',
      tone: 'weak',
      variant: 'dark',
    });
    expect(badge.textContent?.trim()).toBe('default');

    const description = shadow.querySelector('mds-text.description')!;
    expect(description).toEqualAttribute('title', 'Formato file sconosciuto');
    expect(description.textContent?.trim()).toBe('Formato file sconosciuto');
  });
});
