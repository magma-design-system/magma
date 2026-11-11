import { render } from '@stencil/vitest';

// A value is data for its range, as an <option>: it draws nothing of its own (#1261)
describe('mds-input-range-value', () => {
  it('renders, and draws nothing', async () => {
    const { root } = await render<HTMLMdsInputRangeValueElement>(
      '<mds-input-range-value value="20">Minimo</mds-input-range-value>',
    );

    expect(root).toHaveAttribute('hydrated');
    expect(getComputedStyle(root).display).toBe('none');
  });

  it('reflects its value, which its range writes as the thumb moves', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputRangeValueElement>(
      '<mds-input-range-value value="20">Minimo</mds-input-range-value>',
    );

    root.value = 35;
    await waitForChanges();

    expect(root).toHaveAttribute('value', '35');
  });
});
