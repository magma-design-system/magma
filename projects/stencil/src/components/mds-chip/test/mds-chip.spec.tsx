import { newSpecPage } from '@stencil/core/testing'
import { MdsChip } from '../mds-chip'

describe('mds-chip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsChip],
      html: '<mds-chip label="chip"></mds-chip>',
    })
    expect(page.root).toEqualHtml(`
      <mds-chip aria-disabled="false" label="chip" tone="strong" variant="primary">
        <mock:shadow-root>
          <mds-text class="label" truncate="word" typography="caption">chip</mds-text>
        </mock:shadow-root>
      </mds-chip>
    `)
  })
})
