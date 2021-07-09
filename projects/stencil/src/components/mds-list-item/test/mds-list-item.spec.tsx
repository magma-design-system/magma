import { newSpecPage } from '@stencil/core/testing'
import { MdsListItem } from '../mds-list-item'

describe('mds-list-item', () => {
  it('renders', async() => {
    const page = await newSpecPage({
      components: [MdsListItem],
      html: '<mds-list-item></mds-list-item>',
    })
    expect(page.root).toEqualHtml(`
      <mds-list-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-list-item>
    `)
  })
})
