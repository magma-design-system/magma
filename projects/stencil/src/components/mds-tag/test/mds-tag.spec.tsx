import { newSpecPage } from '@stencil/core/testing'
import { MdsTag } from '../mds-tag'

describe('mds-tag', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTag],
      html: '<mds-tag></mds-tag>',
    })
    expect(page.root).toEqualHtml(`
      <mds-tag>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-tag>
    `)
  })
})
