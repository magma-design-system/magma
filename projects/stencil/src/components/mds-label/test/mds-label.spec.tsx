import { newSpecPage } from '@stencil/core/testing'
import { MdsLabel } from '../mds-label'

describe('mds-label', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsLabel],
      html: '<mds-label></mds-label>',
    })
    expect(page.root).toEqualHtml(`
      <mds-label>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-label>
    `)
  })
})
