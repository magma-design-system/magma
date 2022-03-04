import { newSpecPage } from '@stencil/core/testing'
import { MdsIconSvg } from '../mds-icon-svg'

describe('mds-icon-svg', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsIconSvg],
      html: '<mds-icon-svg></mds-icon-svg>',
    })
    expect(page.root).toEqualHtml(`
      <mds-icon-svg>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-icon-svg>
    `)
  })
})
