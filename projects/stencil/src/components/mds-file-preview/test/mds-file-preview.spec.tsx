import { newSpecPage } from '@stencil/core/testing'
import { MdsFilePreview } from '../mds-file-preview'

describe('mds-file-preview', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFilePreview],
      html: '<mds-file-preview></mds-file-preview>',
    })
    expect(page.root).toEqualHtml(`
      <mds-file-preview>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-file-preview>
    `)
  })
})
