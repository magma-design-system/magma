import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
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

    // a filename without an extension has no badge: it used to say `default`
    expect(shadow.querySelector('mds-badge.suffix')).toBeNull();

    const description = shadow.querySelector('mds-text.description')!;
    expect(description).toEqualAttribute('title', 'Formato file sconosciuto');
    expect(description.textContent?.trim()).toBe('Formato file sconosciuto');
  });

  // the card could not be reached from the keyboard; a click emitted the download whether or not
  // the card was downloadable, twice when it was, and turning downloadable off also removed the
  // click handler of the render (#820, #823)
  describe('downloadable', () => {
    const card = (host: HTMLElement) => host.shadowRoot!.querySelector<HTMLElement>('.card')!;

    it('makes the card a button that the pointer, Enter and Space activate once each', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        '<mds-file-preview filename="report.pdf" downloadable></mds-file-preview>',
      );
      const download = spyOnEvent('mdsFileDownload');

      expect(card(root)).toEqualAttributes({ role: 'button', tabindex: '0' });

      await userEvent.click(card(root));
      card(root).focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Space}');
      await waitForChanges();

      expect(download).toHaveReceivedEventTimes(3);
      expect(download.lastEvent?.detail).toMatchObject({
        filename: 'report.pdf',
        extension: 'pdf',
      });
      expect(download.lastEvent?.detail.target).toBe(root);
    });

    it('leaves the card inert without it', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        '<mds-file-preview filename="report.pdf"></mds-file-preview>',
      );
      const download = spyOnEvent('mdsFileDownload');

      expect(card(root)).not.toHaveAttribute('role');
      expect(card(root)).not.toHaveAttribute('tabindex');

      await userEvent.click(card(root));
      await waitForChanges();

      expect(download).not.toHaveReceivedEvent();
    });

    it('follows downloadable when it changes', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsFilePreviewElement>(
        '<mds-file-preview filename="report.pdf" downloadable></mds-file-preview>',
      );
      const download = spyOnEvent('mdsFileDownload');

      root.setAttribute('downloadable', 'false');
      await waitForChanges();
      card(root).click();
      expect(card(root)).not.toHaveAttribute('tabindex');

      root.setAttribute('downloadable', '');
      await waitForChanges();
      card(root).click();
      await waitForChanges();

      expect(download).toHaveReceivedEventTimes(1);
    });
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
