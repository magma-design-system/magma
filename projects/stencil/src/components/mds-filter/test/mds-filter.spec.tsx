import { newSpecPage } from '@stencil/core/testing';
import { MdsFilter } from '../mds-filter';

describe('mds-filter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFilter],
      html: `<mds-filter></mds-filter>`,
    });
    // expect(page.root).toEqualHtml(`
    //   <mds-filter>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-filter>
    // `);
  });
});
