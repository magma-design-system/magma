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
      // the padding of mds-card-footer
      expect(actionGap(root)).toBeCloseTo(16, 0);
    });

    it('stays at the bottom of a card stretched by its row', async () => {
      const { root } = await render(`
        <mds-card style="height: 20rem">
          <mds-card-header><mds-text typography="h6">Logo</mds-text></mds-card-header>
          ${footer}
        </mds-card>`);

      expect(layoutOf(root)).toBe('layout--fh');
      expect(actionGap(root)).toBeCloseTo(16, 0);
    });

    it('stays at the bottom when it is alone', async () => {
      const { root } = await render(`<mds-card style="height: 20rem">${footer}</mds-card>`);

      expect(layoutOf(root)).toBe('layout--f');
      expect(actionGap(root)).toBeCloseTo(16, 0);
    });

    it('keeps its place under a content', async () => {
      const { root } = await render(`
        <mds-card style="height: 20rem">
          <mds-card-header><mds-text typography="h6">Logo</mds-text></mds-card-header>
          <mds-card-content><mds-text>Testo</mds-text></mds-card-content>
          ${footer}
        </mds-card>`);

      expect(layoutOf(root)).toBe('layout--cfh');
      expect(actionGap(root)).toBeCloseTo(16, 0);
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
