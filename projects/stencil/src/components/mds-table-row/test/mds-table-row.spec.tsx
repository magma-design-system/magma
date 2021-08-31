import { newSpecPage } from '@stencil/core/testing'
import { MdsTableRow } from '../mds-table-row'

describe('mds-table-row', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTableRow],
      html: '<mds-table-row></mds-table-row>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table-row>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table-row>
    `)
  })
})
