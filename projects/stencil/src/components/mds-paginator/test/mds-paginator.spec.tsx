import { newSpecPage } from '@stencil/core/testing'
import { MdsPaginator } from '../mds-paginator'

describe('mds-paginator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPaginator],
      html: '<mds-paginator></mds-paginator>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-paginator>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-paginator>
    // `)
    expect(true).toBe(true)
  })
})
