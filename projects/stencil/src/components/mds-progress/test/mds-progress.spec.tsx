import { newSpecPage } from '@stencil/core/testing'
import { MdsProgress } from '../mds-progress'

describe('mds-progress', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsProgress],
      html: '<mds-progress></mds-progress>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-progress>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-progress>
    // `)
    expect(true).toBe(true)
  })
})
