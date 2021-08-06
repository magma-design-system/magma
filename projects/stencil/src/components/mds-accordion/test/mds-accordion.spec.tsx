import { newSpecPage } from '@stencil/core/testing'
import { MdsAccordion } from '../mds-accordion'

describe('mds-accordion', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAccordion],
      html: '<mds-accordion></mds-accordion>',
    })
    expect(page.root).toEqualHtml(`
      <mds-accordion>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-accordion>
    `)
  })
})
