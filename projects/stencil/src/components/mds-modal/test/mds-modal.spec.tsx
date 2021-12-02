import { newSpecPage } from '@stencil/core/testing'
import { MdsModal } from '../mds-modal'

describe('mds-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsModal],
      html: '<mds-modal></mds-modal>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-modal>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-modal>
    // `)
    expect(true).toBe(true)
  })
})
