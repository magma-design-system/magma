import { newSpecPage } from '@stencil/core/testing';
import { MdsTextParagraph } from '../mds-text-paragraph';

describe('mds-text-paragraph', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTextParagraph],
      html: `<mds-text-paragraph></mds-text-paragraph>`,
    });
    expect(page.root).toEqualHtml(`
      <mds-text-paragraph>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-text-paragraph>
    `);
  });
});
