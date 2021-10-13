import { newSpecPage } from '@stencil/core/testing'
import { MdsNote } from '../mds-note'

describe('mds-note', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsNote],
      html: '<mds-note></mds-note>',
    })
    expect(page.root).toEqualHtml(`
      <mds-note>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-note>
    `)
  })
})
