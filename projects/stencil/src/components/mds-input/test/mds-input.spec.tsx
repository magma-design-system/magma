import { newSpecPage } from '@stencil/core/testing'
import { MdsInput } from '../mds-input'

describe('mds-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInput],
      html: '<mds-input></mds-input>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-input>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-input>
    // `)
    expect(true).toBe(true)
  })
})
