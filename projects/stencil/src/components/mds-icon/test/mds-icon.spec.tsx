import { newSpecPage } from '@stencil/core/testing'
import { MdsIcon } from '../mds-icon'

describe('mds-icon', () => {
  it('renders', async() => {
    const page = await newSpecPage({
      components: [MdsIcon],
      html: '<mds-icon></mds-icon>',
    })
    expect(page.root).toEqualHtml(`
      <mds-icon>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-icon>
    `)
  })
})
