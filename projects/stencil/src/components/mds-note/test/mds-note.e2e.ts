import { render } from '@stencil/vitest';
import { themeLabelVariantDictionary } from '@type/variant';

describe('mds-note', () => {
  it('renders', async () => {
    const { root } = await render('<mds-note></mds-note>');

    expect(root).toHaveAttribute('hydrated');
  });
  describe('the label color variants', () => {
    /** The value that drives the paint; a variant with no block of its own never reaches it. */
    const painted = async (variant: string): Promise<string> => {
      const { root } = await render(`<mds-note variant="${variant}">nota</mds-note>`);
      return getComputedStyle(root).getPropertyValue('--mds-note-background').trim();
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
