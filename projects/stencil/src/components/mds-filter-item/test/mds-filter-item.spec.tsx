import { newSpecPage } from '@stencil/core/testing';
import { MdsFilterItem } from '../mds-filter-item';

describe('mds-filter-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFilterItem],
      html: `<mds-filter-item></mds-filter-item>`,
    });
    // expect(page.root).toEqualHtml(`
    //   <mds-filter-item>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-filter-item>
    // `);
  });
});
