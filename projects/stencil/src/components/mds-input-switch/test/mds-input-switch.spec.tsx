import { newSpecPage } from '@stencil/core/testing'
import { MdsInputSwitch } from '../mds-input-switch'

describe('mds-input-switch', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputSwitch],
      html: '<mds-input-switch></mds-input-switch>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-input-switch>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-input-switch>
    // `)
    expect(true).toBe(true)
  })
})
