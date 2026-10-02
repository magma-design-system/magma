import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { themeLabelVariantDictionary } from '@type/variant';

describe('mds-file-preview', () => {
  it('renders', async () => {
    const { root } = await render('<mds-file-preview filename=""></mds-file-preview>');

    expect(root).toHaveAttribute('hydrated');
    // the infos row is not a page landmark: several previews on a page are not several footers
    expect(root.shadowRoot!.querySelector('footer')).toBeNull();
    expect(root.shadowRoot!.querySelector('.infos')).not.toBeNull();
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
  // a removed attribute leaves null, the value Angular and Vue bind for a missing one
  describe('once an attribute is removed', () => {
    beforeEach(() => {
      mockIconFetch();
    });

    it('drops the status style of a removed message', async () => {
      const { root, waitForChanges } = await render(
        '<mds-file-preview filename="a.pdf" message="Uploading"></mds-file-preview>',
      );
      expect(root.shadowRoot!.querySelector('.preview--status')).not.toBeNull();

      root.removeAttribute('message');
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.preview--status')).toBeNull();
      expect(root.shadowRoot!.querySelector('.preview--icon')).not.toBeNull();
    });

    it('drops the image preview of a removed src', async () => {
      const { root, waitForChanges } = await render(
        '<mds-file-preview filename="a.png" src="/assets/images/a.png"></mds-file-preview>',
      );
      expect(root.shadowRoot!.querySelector('.preview--image')).not.toBeNull();

      root.removeAttribute('src');
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.preview--image')).toBeNull();
    });

    it('shows the description again in place of a removed filesize', async () => {
      const { root, waitForChanges } = await render(
        '<mds-file-preview filename="a.pdf" filesize="1024"></mds-file-preview>',
      );
      expect(root.shadowRoot!.querySelector('.description')).toBeNull();

      root.removeAttribute('filesize');
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.description')).not.toBeNull();
    });

    it('shows the format icon in place of a removed icon', async () => {
      const { root, waitForChanges } = await render(
        '<mds-file-preview filename="a.pdf" icon="mdi/alien"></mds-file-preview>',
      );

      root.removeAttribute('icon');
      await waitForChanges();

      const icon = root.shadowRoot!.querySelector<HTMLMdsIconElement>('.preview mds-icon')!;
      expect(icon.name).toBeTruthy();
    });
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
