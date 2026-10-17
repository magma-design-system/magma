import { render } from '@stencil/vitest';

describe('mds-card', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card></mds-card>');

    expect(root).toHaveAttribute('hydrated');
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
