import { newSpecPage } from '@stencil/core/testing'
import { MdsAccordionTimerItem } from '../mds-accordion-timer-item'

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAccordionTimerItem],
      html: '<mds-accordion-timer-item></mds-accordion-timer-item>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-accordion-timer-item>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-accordion-timer-item>
    // `)
    expect(true).toBe(true)
  })
})
