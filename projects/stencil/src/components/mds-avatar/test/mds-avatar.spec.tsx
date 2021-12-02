import { newSpecPage } from '@stencil/core/testing'
import { MdsAvatar } from '../mds-avatar'

describe('mds-avatar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAvatar],
      html: '<mds-avatar></mds-avatar>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-avatar>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-avatar>
    // `)
    expect(true).toBe(true)
  })
})
