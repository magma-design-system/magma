import { newSpecPage } from '@stencil/core/testing'
import { MdsPill } from '../mds-pill'

describe('mds-pill', () => {
  it('renders', async() => {
    const page = await newSpecPage({
      components: [MdsPill],
      html: '<mds-pill></mds-pill>',
    })
    expect(page.root).toEqualHtml(`
      <mds-pill>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-pill>
    `)
  })
})
