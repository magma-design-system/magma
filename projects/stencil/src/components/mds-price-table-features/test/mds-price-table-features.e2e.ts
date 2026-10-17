import { render } from '@stencil/vitest';

// the cells fade their border colour in: read it once the transition is over
const settled = async (element: Element): Promise<void> => {
  await Promise.all(
    element
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );
};

describe('mds-price-table-features', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-features></mds-price-table-features>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #824: the border colour was documented for the children, and only the header band read it
  it('gives its border colour to the dividers of the cells', async () => {
    const { root } = await render(`
      <mds-price-table-features label="Funzioni" style="--mds-price-table-features-border-color: rgb(1 2 3)">
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Archivio</mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
      </mds-price-table-features>
    `);
    const cell = root.querySelector('mds-price-table-features-cell')!;
    await settled(cell);

    expect(getComputedStyle(root.shadowRoot!.querySelector('header')!).borderBottomColor).toBe(
      'rgb(1, 2, 3)',
    );
    expect(getComputedStyle(cell).borderBottomColor).toBe('rgb(1, 2, 3)');
  });
});
