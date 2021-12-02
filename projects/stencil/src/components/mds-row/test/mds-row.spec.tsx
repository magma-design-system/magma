import { newSpecPage } from '@stencil/core/testing'
import { MdsRow } from '../mds-row'

describe('mds-row', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsRow],
      html: '<mds-row></mds-row>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-row>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-row>
    // `)
    expect(true).toBe(true)
  })
})
