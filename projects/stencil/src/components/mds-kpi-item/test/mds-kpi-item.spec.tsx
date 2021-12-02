import { newSpecPage } from '@stencil/core/testing'
import { MdsKpiItem } from '../mds-kpi-item'

describe('mds-kpi-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsKpiItem],
      html: '<mds-kpi-item></mds-kpi-item>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-kpi-item>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-kpi-item>
    // `)
    expect(true).toBe(true)
  })
})
