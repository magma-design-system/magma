import { newSpecPage } from '@stencil/core/testing';
import { MdsChip } from '../mds-chip';

describe('mds-chip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsChip],
      html: `<mds-chip></mds-chip>`,
    });
    expect(page.root).toEqualHtml(`
      <mds-chip>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-chip>
    `);
  });
});
