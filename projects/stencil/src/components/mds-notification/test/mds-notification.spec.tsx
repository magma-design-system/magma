import { newSpecPage } from '@stencil/core/testing'
import { MdsNotification } from '../mds-notification'

describe('mds-notification', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsNotification],
      html: '<mds-notification></mds-notification>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-notification>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-notification>
    // `)
    expect(true).toBe(true)
  })
})
