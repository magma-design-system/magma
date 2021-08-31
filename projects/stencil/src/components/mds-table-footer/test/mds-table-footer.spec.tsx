import { newSpecPage } from '@stencil/core/testing'
import { MdsTableFooter } from '../mds-table-footer'

describe('mds-table-footer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsTableFooter],
      html: '<mds-table-footer></mds-table-footer>',
    })
    expect(page.root).toEqualHtml(`
      <mds-table-footer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-table-footer>
    `)
  })
})
