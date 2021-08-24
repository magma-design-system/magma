import { newSpecPage } from '@stencil/core/testing'
import { MdsAuthor } from '../mds-author'

describe('mds-author', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsAuthor],
      html: '<mds-author></mds-author>',
    })
    expect(page.root).toEqualHtml(`
      <mds-author>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-author>
    `)
  })
})
