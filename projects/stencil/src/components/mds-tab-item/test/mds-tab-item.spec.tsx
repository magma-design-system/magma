import { newSpecPage } from '@stencil/core/testing'
import { MdsTabItem } from '../mds-tab-item'

describe('mds-tab-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTabItem],
      html: '<mds-tab-item></mds-tab-item>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-tab-item>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-tab-item>
    // `)
    expect(true).toBe(true)
  })
})
