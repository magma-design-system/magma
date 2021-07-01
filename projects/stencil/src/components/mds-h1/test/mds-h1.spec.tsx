import { newSpecPage } from '@stencil/core/testing';
import { MdsH1 } from '../mds-h1';

describe('mds-h1', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsH1],
      html: `<mds-h1></mds-h1>`,
    });
    expect(page.root).toEqualHtml(`
      <mds-h1>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-h1>
    `);
  });
});
