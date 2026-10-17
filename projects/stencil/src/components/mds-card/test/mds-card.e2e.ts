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
});
