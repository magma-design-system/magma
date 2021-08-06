import { newSpecPage } from '@stencil/core/testing'
import { MdsAccordionItem } from '../mds-accordion-item'

describe('mds-accordion-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAccordionItem],
      html: '<mds-accordion-item></mds-accordion-item>',
    })
    expect(page.root).toEqualHtml(`
      <mds-accordion-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-accordion-item>
    `)
  })
})
