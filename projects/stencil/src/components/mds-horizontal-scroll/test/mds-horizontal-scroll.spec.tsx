import { newSpecPage } from '@stencil/core/testing'
import { MdsHorizontalScroll } from '../mds-horizontal-scroll'

describe('mds-horizontal-scroll', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsHorizontalScroll],
      html: '<mds-horizontal-scroll></mds-horizontal-scroll>',
    })
    expect(page.root).toEqualHtml(`
      <mds-horizontal-scroll>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-horizontal-scroll>
    `)
  })
})
