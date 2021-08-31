import { newSpecPage } from '@stencil/core/testing'
import { MdsFlexTable } from '../mds-flex-table'

describe('mds-flex-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFlexTable],
      html: '<mds-flex-table></mds-flex-table>',
    })
    expect(page.root).toEqualHtml(`
      <mds-flex-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-flex-table>
    `)
  })
})
