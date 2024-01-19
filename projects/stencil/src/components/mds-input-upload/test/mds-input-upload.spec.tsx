import { newSpecPage } from '@stencil/core/testing'
import { MdsInputUpload } from '../mds-input-upload'

describe('mds-input-upload', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputUpload],
      html: '<mds-input-upload></mds-input-upload>',
    })
    expect(page.root).toEqualHtml(`
      <mds-input-upload>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-input-upload>
    `)
  })
})
