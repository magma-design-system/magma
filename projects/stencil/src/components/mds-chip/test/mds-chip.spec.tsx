import { newSpecPage } from '@stencil/core/testing'
import { MdsChip } from '../mds-chip'

describe('mds-chip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsChip],
      html: '<mds-chip></mds-chip>',
    })
    expect(page.root).toEqualHtml(`
      <mds-chip aria-disabled="false">
        <mock:shadow-root>
          <mds-text class="label" tabindex="0" truncate="" typography="caption"></mds-text>
        </mock:shadow-root>
      </mds-chip>
    `)
  })
})
