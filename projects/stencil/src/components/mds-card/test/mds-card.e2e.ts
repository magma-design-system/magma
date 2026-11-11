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
        <mds-card style="width: 30rem">
          <mds-card-footer><mds-button label="Annulla"></mds-button><mds-button label="Apri"></mds-button></mds-card-footer>
        </mds-card>`);
      const [first, second] = Array.from(root.querySelectorAll('mds-button'));

      expect(rect(second).left - rect(first).right).toBeCloseTo(12, 0);
    });

    // actions/stacked: under 380px of the footer (272px in a card of 20rem) the row stacks, every
    // action at the full width in the order of the row, rhythm/inline between them
    it('stacks the actions of a narrow footer, each at its full width', async () => {
      const { root } = await render(`
        <mds-card style="width: 20rem">
          <mds-card-footer><mds-button label="Annulla"></mds-button><mds-button label="Apri"></mds-button></mds-card-footer>
        </mds-card>`);
      const footer = rect(root.querySelector('mds-card-footer')!);
      const [first, second] = Array.from(root.querySelectorAll('mds-button')).map(rect);

      expect(second.top - first.bottom).toBeCloseTo(12, 0);
      for (const action of [first, second]) expect(action.width).toBeCloseTo(footer.width, 0);
    });

    // #1250: one action has no order to keep, so the stack would change only its width: it keeps
    // its own width at the end of the row (place), a split button too, whose host would otherwise
    // paint its fill past its two buttons
    it.each([
      ['mds-button', '<mds-button label="Leggi" tone="text"></mds-button>'],
      ['mds-button-dropdown', '<mds-button-dropdown label="Scarica"></mds-button-dropdown>'],
    ])('keeps a lone %s of a narrow footer at its own width, at the end', async (tag, action) => {
      const { root } = await render(`
        <mds-card style="width: 20rem">
          <mds-card-footer>${action}</mds-card-footer>
        </mds-card>`);
      const footer = rect(root.querySelector('mds-card-footer')!);
      const lone = rect(root.querySelector(tag)!);

      expect(footer.width).toBeLessThan(380);
      expect(lone.width).toBeLessThan(footer.width / 2);
      expect(lone.right).toBeCloseTo(footer.right, 0);
    });

    it('still stacks a narrow footer whose lone action stands beside a text', async () => {
      const { root } = await render(`
        <mds-card style="width: 20rem">
          <mds-card-footer><mds-text>3 allegati</mds-text><mds-button label="Apri"></mds-button></mds-card-footer>
        </mds-card>`);
      const footer = rect(root.querySelector('mds-card-footer')!);

      expect(rect(root.querySelector('mds-button')!).width).toBeCloseTo(footer.width, 0);
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

  // #1327: the card set no colour, and on the band of an introduction its text took the ink of
  // the band, white on its own white surface
  describe('the text', () => {
    it('takes the text of its surface, not the colour of what it stands on', async () => {
      const { root } = await render(`
        <div style="color: rgb(250 250 250); --magma-text-default: 1 2 3">
          <mds-card>
            <mds-card-content>Testo</mds-card-content>
          </mds-card>
        </div>`);
      const card = root.querySelector('mds-card')!;

      expect(getComputedStyle(card).color).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(card.querySelector('mds-card-content')!).color).toBe('rgb(1, 2, 3)');
    });

    it('takes the colour of --mds-card-color', async () => {
      const { root } = await render(`
        <mds-card style="--mds-card-color: rgb(4 5 6)">
          <mds-card-content>Testo</mds-card-content>
        </mds-card>`);

      expect(getComputedStyle(root.querySelector('mds-card-content')!).color).toBe('rgb(4, 5, 6)');
    });

    it('gives way to a colour set on its host', async () => {
      const { root } = await render(`<mds-card style="color: rgb(7 8 9)"></mds-card>`);

      expect(getComputedStyle(root).color).toBe('rgb(7, 8, 9)');
    });
  });
});
