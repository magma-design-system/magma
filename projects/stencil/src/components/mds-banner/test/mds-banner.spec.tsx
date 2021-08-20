import { newSpecPage } from '@stencil/core/testing'
import { MdsBanner } from '../mds-banner'

describe('mds-banner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsBanner],
      html: '<mds-banner></mds-banner>',
    })
    expect(page.root).toEqualHtml(`
      <mds-banner>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-banner>
    `)
  })
})
