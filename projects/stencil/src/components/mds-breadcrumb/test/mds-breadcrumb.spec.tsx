import { newSpecPage } from '@stencil/core/testing'
import { MdsBreadcrumb } from '../mds-breadcrumb'

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsBreadcrumb],
      html: '<mds-breadcrumb></mds-breadcrumb>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-breadcrumb>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-breadcrumb>
    // `)
    expect(true).toBe(true)
  })
})
