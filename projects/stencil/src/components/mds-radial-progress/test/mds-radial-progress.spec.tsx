import { newSpecPage } from '@stencil/core/testing'
import { MdsRadialProgress } from '../mds-radial-progress'

describe('mds-radial-progress', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsRadialProgress],
      html: '<mds-radial-progress></mds-radial-progress>',
    })
    expect(page.root).toEqualHtml(`
      <mds-radial-progress>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-radial-progress>
    `)
  })
})
