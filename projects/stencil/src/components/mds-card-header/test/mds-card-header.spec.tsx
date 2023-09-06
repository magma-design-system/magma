import { newSpecPage } from '@stencil/core/testing'
import { MdsCardHeader } from '../mds-card-header'

describe('mds-card-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsCardHeader],
      html: '<mds-card-header></mds-card-header>',
    })
    expect(page.root).toEqualHtml(`
      <mds-card-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-card-header>
    `)
  })
})
