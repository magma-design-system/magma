import { newSpecPage } from '@stencil/core/testing'
import { MdsTable } from '../mds-table'

describe('mds-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTable],
      html: '<mds-table></mds-table>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table>
    `)
  })
})
