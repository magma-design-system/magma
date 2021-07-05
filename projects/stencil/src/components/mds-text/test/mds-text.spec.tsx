import { newSpecPage } from '@stencil/core/testing';
import { MdsText } from '../mds-text';

describe('mds-text', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsText],
      html: `<mds-text></mds-text>`,
    });
    expect(page.root).toEqualHtml(`
      <mds-text>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-text>
    `);
  });
});
