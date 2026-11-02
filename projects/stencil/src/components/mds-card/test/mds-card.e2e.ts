import { render, vi } from '@stencil/vitest';

const layoutOf = (card: HTMLElement): string | undefined =>
  Array.from(card.shadowRoot!.querySelector('.layout')!.classList).find(
    (name) => name.startsWith('layout--') && name !== 'layout--disabled',
  );

describe('mds-card', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card></mds-card>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #826: the layout was read once, on load, and a plain element named its region after its tag
  describe('the layout', () => {
    it('follows the slots of plain elements', async () => {
      const { root } = await render(`
        <mds-card>
          <div slot="header">Header</div>
          <div slot="media">Media</div>
          <div slot="content">Content</div>
          <div slot="footer">Footer</div>
        </mds-card>
      `);

      expect(layoutOf(root)).toBe('layout--cfhm');
    });

    it('takes the regions of the mds-card children', async () => {
      const { root } = await render(`
        <mds-card>
          <mds-card-header>Header</mds-card-header>
          <mds-card-content>Content</mds-card-content>
        </mds-card>
      `);

      expect(layoutOf(root)).toBe('layout--ch');
    });

    it('follows the regions added and removed after load', async () => {
      const { root, waitForChanges } = await render(
        '<mds-card><mds-card-header>Header</mds-card-header></mds-card>',
      );
      expect(layoutOf(root)).toBe('layout--h');

      const footer = document.createElement('div');
      footer.slot = 'footer';
      root.appendChild(footer);
      root.appendChild(document.createElement('mds-card-content'));
      await vi.waitFor(() => expect(layoutOf(root)).toBe('layout--cfh'));

      footer.remove();
      await waitForChanges();
      await vi.waitFor(() => expect(layoutOf(root)).toBe('layout--ch'));
    });
  });

  // #1040: without a content the footer took the row that stretches, and the actions of a
  // taller card rose under the header instead of staying at its bottom
  describe('the footer', () => {
    // the bottom of the action, measured from the bottom of the card
    const actionGap = (card: HTMLElement): number =>
      card.getBoundingClientRect().bottom -
      card.querySelector('mds-button')!.getBoundingClientRect().bottom;
    const footer = '<mds-card-footer><mds-button label="Download"></mds-button></mds-card-footer>';

    it('stays at the bottom beside a taller media', async () => {
      const { root } = await render(`
        <mds-card style="width: 40rem">
          <mds-card-media><div style="height: 12rem"></div></mds-card-media>
          <mds-card-header><mds-text typography="h6">Logo</mds-text></mds-card-header>
          ${footer}
        </mds-card>`);

      expect(layoutOf(root)).toBe('layout--fhm');
      // the inset of the card (#1189, rhythm/inset)
      expect(actionGap(root)).toBeCloseTo(24, 0);
    });

    it('stays at the bottom of a card stretched by its row', async () => {
      const { root } = await render(`
        <mds-card style="height: 20rem">
          <mds-card-header><mds-text typography="h6">Logo</mds-text></mds-card-header>
          ${footer}
        </mds-card>`);

      expect(layoutOf(root)).toBe('layout--fh');
      expect(actionGap(root)).toBeCloseTo(24, 0);
    });

    it('stays at the bottom when it is alone', async () => {
      const { root } = await render(`<mds-card style="height: 20rem">${footer}</mds-card>`);

      expect(layoutOf(root)).toBe('layout--f');
      expect(actionGap(root)).toBeCloseTo(24, 0);
    });

    it('keeps its place under a content', async () => {
      const { root } = await render(`
        <mds-card style="height: 20rem">
          <mds-card-header><mds-text typography="h6">Logo</mds-text></mds-card-header>
          <mds-card-content><mds-text>Testo</mds-text></mds-card-content>
          ${footer}
        </mds-card>`);

      expect(layoutOf(root)).toBe('layout--cfh');
      expect(actionGap(root)).toBeCloseTo(24, 0);
    });
  });

  // #1189: one inset shared by the regions (rhythm/inset, rhythm/shared-inset), the title 12px
  // from its content (rhythm/title-content), the actions 24px from it (rhythm/content-actions),
  // the media out to the edges of the card it touches (rhythm/media-bleed)
  describe('the rhythm', () => {
    const rect = (element: Element): DOMRect => element.getBoundingClientRect();
    const part = (card: HTMLElement, name: string): DOMRect =>
      rect(card.querySelector(`mds-card-${name}`)!);
    const header = '<mds-card-header><mds-text typography="h6">Titolo</mds-text></mds-card-header>';
    const media = '<mds-card-media><div style="height: 8rem"></div></mds-card-media>';
    const content = '<mds-card-content><mds-text>Testo</mds-text></mds-card-content>';
    const footer = '<mds-card-footer><mds-button label="Apri"></mds-button></mds-card-footer>';

    it('pads its regions with one inset, the title 12px from its content and the actions 24px', async () => {
      const { root } = await render(
        `<mds-card style="width: 20rem">${header}${content}${footer}</mds-card>`,
      );
      const card = rect(root);

      expect(part(root, 'header').top - card.top).toBeCloseTo(24, 0);
      expect(part(root, 'header').left - card.left).toBeCloseTo(24, 0);
      expect(card.right - part(root, 'content').right).toBeCloseTo(24, 0);
      expect(part(root, 'content').top - part(root, 'header').bottom).toBeCloseTo(12, 0);
      expect(part(root, 'footer').top - part(root, 'content').bottom).toBeCloseTo(24, 0);
      expect(card.bottom - part(root, 'footer').bottom).toBeCloseTo(24, 0);
    });

    it('sets the actions of the footer 12px apart', async () => {
      const { root } = await render(`
        <mds-card style="width: 20rem">
          <mds-card-footer><mds-button label="Annulla"></mds-button><mds-button label="Apri"></mds-button></mds-card-footer>
        </mds-card>`);
      const [first, second] = Array.from(root.querySelectorAll('mds-button'));

      expect(rect(second).left - rect(first).right).toBeCloseTo(12, 0);
    });

    it('takes the media to the side edges of a narrow card, 12px from the title and the content', async () => {
      const { root } = await render(
        `<mds-card style="width: 20rem">${header}${media}${content}</mds-card>`,
      );
      const card = rect(root);
      const image = part(root, 'media');

      expect(layoutOf(root)).toBe('layout--chm');
      expect(image.left).toBeCloseTo(card.left, 0);
      expect(image.right).toBeCloseTo(card.right, 0);
      expect(image.top - part(root, 'header').bottom).toBeCloseTo(12, 0);
      expect(part(root, 'content').top - image.bottom).toBeCloseTo(12, 0);
    });

    it('takes the media to the top edge when no header stands above it', async () => {
      const { root } = await render(
        `<mds-card style="width: 20rem">${media}${content}${footer}</mds-card>`,
      );

      expect(layoutOf(root)).toBe('layout--cfm');
      expect(part(root, 'media').top).toBeCloseTo(rect(root).top, 0);
      expect(part(root, 'content').top - part(root, 'media').bottom).toBeCloseTo(12, 0);
    });

    it('fills a card that holds only a media', async () => {
      const { root } = await render(`<mds-card style="width: 20rem">${media}</mds-card>`);
      const card = rect(root);
      const image = part(root, 'media');

      expect([image.left, image.top, image.right, image.bottom]).toEqual(
        [card.left, card.top, card.right, card.bottom].map((edge) => expect.closeTo(edge, 0)),
      );
    });

    // the side follows the container query of the grid areas, never the order of the slots: a
    // margin written for the wide layout pushed the media out of a narrow card (2026-11-02)
    it('takes the media to the start, top and bottom edges of a wide card', async () => {
      const { root } = await render(
        `<mds-card style="width: 40rem">${header}${media}${content}${footer}</mds-card>`,
      );
      const card = rect(root);
      const image = part(root, 'media');

      expect(layoutOf(root)).toBe('layout--cfhm');
      expect(image.left).toBeCloseTo(card.left, 0);
      expect(image.top).toBeCloseTo(card.top, 0);
      expect(image.bottom).toBeCloseTo(card.bottom, 0);
      expect(part(root, 'header').left - image.right).toBeCloseTo(12, 0);
      expect(card.right - part(root, 'header').right).toBeCloseTo(24, 0);
    });

    // the wide media + content layout declared a second, empty row, and the gap under it grew the card
    it('lays a wide media and content on one row, with no gap under them', async () => {
      const { root } = await render(`<mds-card style="width: 40rem">${media}${content}</mds-card>`);

      expect(layoutOf(root)).toBe('layout--cm');
      expect(part(root, 'media').bottom).toBeCloseTo(rect(root).bottom, 0);
      expect(part(root, 'media').top).toBeCloseTo(rect(root).top, 0);
    });

    it('keeps the inset and the gap a product writes on its public properties', async () => {
      const { root } = await render(`
        <mds-card style="width: 20rem; --mds-card-padding: 8px; --mds-card-gap: 4px">
          ${header}${media}${content}${footer}
        </mds-card>`);

      expect(part(root, 'header').top - rect(root).top).toBeCloseTo(8, 0);
      expect(part(root, 'media').left).toBeCloseTo(rect(root).left, 0);
      expect(part(root, 'content').top - part(root, 'media').bottom).toBeCloseTo(4, 0);
      // the actions keep rhythm/content-actions from the content
      expect(part(root, 'footer').top - part(root, 'content').bottom).toBeCloseTo(24, 0);
    });

    it('parts the footer by a gap larger than rhythm/content-actions too', async () => {
      const { root } = await render(`
        <mds-card style="width: 20rem; --mds-card-gap: 40px">${header}${content}${footer}</mds-card>`);

      expect(part(root, 'footer').top - part(root, 'content').bottom).toBeCloseTo(40, 0);
    });
  });

  // #824: the property coloured only the regions, the card kept its own surface around them
  it('paints the card and its regions with its background', async () => {
    const { root } = await render(`
      <mds-card style="--mds-card-background: rgb(1 2 3)">
        <mds-card-content slot="content">Testo</mds-card-content>
      </mds-card>`);

    expect(getComputedStyle(root).backgroundColor).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(root.querySelector('mds-card-content')!).backgroundColor).toBe(
      'rgb(1, 2, 3)',
    );
  });
});
