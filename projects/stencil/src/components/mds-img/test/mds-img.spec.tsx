import { newSpecPage } from '@stencil/core/testing'
import { MdsImg } from '../mds-img'

describe('mds-img', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsImg],
      html: '<mds-img></mds-img>',
    })
    expect(page.root).toEqualHtml(`
      <mds-img>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-img>
    `)
  })
})
