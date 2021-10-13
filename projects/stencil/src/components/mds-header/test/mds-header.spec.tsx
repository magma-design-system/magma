import { newSpecPage } from '@stencil/core/testing'
import { MdsHeader } from '../mds-header'

describe('mds-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsHeader],
      html: '<mds-header></mds-header>',
    })
    expect(page.root).toEqualHtml(`
      <mds-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-header>
    `)
  })
})
