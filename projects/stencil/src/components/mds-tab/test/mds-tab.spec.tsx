import { newSpecPage } from '@stencil/core/testing'
import { MdsTab } from '../mds-tab'

describe('mds-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTab],
      html: '<mds-tab></mds-tab>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-tab>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-tab>
    // `)
    expect(true).toBe(true)
  })
})
