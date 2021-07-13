import { newSpecPage } from '@stencil/core/testing'
import { MdsFileExtension } from '../mds-file-extension'

describe('mds-file-extension', () => {
  it('renders', async() => {
    const page = await newSpecPage({
      components: [MdsFileExtension],
      html: '<mds-file-extension></mds-file-extension>',
    })
    expect(page.root).toEqualHtml(`
      <mds-file-extension>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-file-extension>
    `)
  })
})
