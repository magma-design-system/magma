import { newSpecPage } from '@stencil/core/testing'
import { MdsList } from '../mds-list'

describe('mds-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsList],
      html: '<mds-list></mds-list>',
    })
    expect(page.root).toEqualHtml(`
      <mds-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-list>
    `)
  })
})
