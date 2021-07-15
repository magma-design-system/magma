import { newSpecPage } from '@stencil/core/testing'
import { MdsGrid } from '../mds-grid'

describe('mds-grid', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsGrid],
      html: '<mds-grid></mds-grid>',
    })
    expect(page.root).toEqualHtml(`
      <mds-grid>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-grid>
    `)
  })
})
