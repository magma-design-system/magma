import { newSpecPage } from '@stencil/core/testing';
import { MdsTypoH1 } from '../mds-typo-h1';

describe('mds-typo-h1', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTypoH1],
      html: `<mds-typo-h1></mds-typo-h1>`,
    });
    expect(page.root).toEqualHtml(`
      <mds-typo-h1>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-typo-h1>
    `);
  });
});
