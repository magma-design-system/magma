import { newSpecPage } from '@stencil/core/testing'
import { MdsUrlView } from '../mds-url-view'

describe('mds-url-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsUrlView],
      html: '<mds-url-view></mds-url-view>',
    })
    expect(page.root).toEqualHtml(`
      <mds-url-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-url-view>
    `)
  })
})
