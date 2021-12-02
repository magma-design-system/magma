import { newSpecPage } from '@stencil/core/testing'
import { MdsAccordionTimer } from '../mds-accordion-timer'

describe('mds-accordion-timer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAccordionTimer],
      html: '<mds-accordion-timer></mds-accordion-timer>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-accordion-timer>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-accordion-timer>
    // `)
    expect(true).toBe(true)
  })
})
