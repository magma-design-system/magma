import { newSpecPage } from '@stencil/core/testing'
import { MdsDownload } from '../mds-download'

describe('mds-download', () => {
  it('renders', async() => {
    const page = await newSpecPage({
      components: [MdsDownload],
      html: '<mds-download></mds-download>',
    })
    expect(page.root).toEqualHtml(`
      <mds-download>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-download>
    `)
  })
})
