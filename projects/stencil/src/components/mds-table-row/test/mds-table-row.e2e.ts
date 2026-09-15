import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-table-row', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-table-row><mds-table-cell>Cell</mds-table-cell></mds-table-row>',
    );

    expect(root).toHaveAttribute('hydrated');
    expect(root).toHaveAttribute('role', 'row');
  });

  describeConditionalSlot({
    html: '<mds-table-row><mds-table-cell>Cell</mds-table-cell></mds-table-row>',
    slot: 'action',
    region: '.actions-cell',
  });
});
