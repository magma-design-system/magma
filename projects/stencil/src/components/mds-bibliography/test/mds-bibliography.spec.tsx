import { newSpecPage } from '@stencil/core/testing'
import { MdsBibliography } from '../mds-bibliography'

describe('mds-bibliography', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsBibliography],
      html: '<mds-bibliography></mds-bibliography>',
    })
    expect(page.root).toEqualHtml(`
      <mds-bibliography>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-bibliography>
    `)
  })
})
