import { newSpecPage } from '@stencil/core/testing'
import { MdsTableBody } from '../mds-table-body'

describe('mds-table-body', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTableBody],
      html: '<mds-table-body></mds-table-body>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table-body>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table-body>
    `)
  })
})
