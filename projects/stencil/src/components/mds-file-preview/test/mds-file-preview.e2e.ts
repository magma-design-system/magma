import { render } from '@stencil/vitest';
import { themeLabelVariantDictionary } from '@type/variant';

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
  describe('the label color variants', () => {
    /** The value that drives the paint; a variant with no block of its own never reaches it. */
    const painted = async (variant: string): Promise<string> => {
      const { root } = await render(
        `<mds-file-preview variant="${variant}" message filename="a.pdf"></mds-file-preview>`,
      );
      return getComputedStyle(root).getPropertyValue('--mds-file-preview-icon-background').trim();
    };

    it('paints every variant of the dictionary, none of them falling back', async () => {
      // red and purple were in the dictionary and in the tokens, but had no block here:
      // they painted the default, silently
      const fallback = await painted('there-is-no-such-variant');

      for (const variant of themeLabelVariantDictionary) {
        expect([variant, await painted(variant)]).not.toEqual([variant, fallback]);
      }
    });
  });
});
