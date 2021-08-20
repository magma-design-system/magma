import { newSpecPage } from '@stencil/core/testing'
import { MdsBadge } from '../mds-badge'

describe('mds-badge', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsBadge],
      html: '<mds-badge></mds-badge>',
    })
    expect(page.root).toEqualHtml(`
      <mds-badge>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-badge>
    `)
  })
})
