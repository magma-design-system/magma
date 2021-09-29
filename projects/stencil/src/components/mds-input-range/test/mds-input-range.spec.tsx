import { newSpecPage } from '@stencil/core/testing'
import { MdsInputRange } from '../mds-input-range'

describe('mds-input-range', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputRange],
      html: '<mds-input-range></mds-input-range>',
    })
    expect(page.root).toEqualHtml(`
      <mds-input-range>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-input-range>
    `)
  })
})
