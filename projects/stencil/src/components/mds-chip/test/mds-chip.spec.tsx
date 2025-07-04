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
          <mds-button class="button-delete button-delete--hidden" size="sm" title="Remove chip" tone="quiet" variant="dark"></mds-button>
        </mock:shadow-root>
      </mds-chip>
    `)
  })
})
