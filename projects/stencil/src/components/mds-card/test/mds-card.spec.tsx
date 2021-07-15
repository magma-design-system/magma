import { newSpecPage } from '@stencil/core/testing'
import { MdsCard } from '../mds-card'

describe('mds-card', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsCard],
      html: '<mds-card></mds-card>',
    })
    expect(page.root).toEqualHtml(`
      <mds-card>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-card>
    `)
  })
})
