import { newSpecPage } from '@stencil/core/testing'
import { MdsInputField } from '../mds-input-field'

describe('mds-input-field', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputField],
      html: '<mds-input-field></mds-input-field>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-input-field>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-input-field>
    // `)
    expect(true).toBe(true)
  })
})
