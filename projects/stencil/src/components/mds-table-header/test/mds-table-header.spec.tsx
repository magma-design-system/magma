import { newSpecPage } from '@stencil/core/testing'
import { MdsTableHeader } from '../mds-table-header'

describe('mds-table-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTableHeader],
      html: '<mds-table-header></mds-table-header>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table-header>
    `)
  })
})
