import { newSpecPage } from '@stencil/core/testing'
import { MdsButton } from '../mds-button'

describe('mds-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsButton],
      html: '<mds-button></mds-button>',
    })
    expect(page.root).toEqualHtml(`
      <mds-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-button>
    `)
  })
})
