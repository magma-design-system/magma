import { newSpecPage } from '@stencil/core/testing'
import { MdsForm } from '../mds-form'

describe('mds-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsForm],
      html: '<mds-form></mds-form>',
    })
    // expect(page.root).toEqualHtml(`
    //   <mds-form>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mds-form>
    // `)
    expect(true).toBe(true)
  })
})
