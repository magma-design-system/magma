import { newSpecPage } from '@stencil/core/testing'
import { MdsTableCell } from '../mds-table-cell'

describe('mds-table-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTableCell],
      html: '<mds-table-cell></mds-table-cell>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table-cell>
    `)
  })
})
