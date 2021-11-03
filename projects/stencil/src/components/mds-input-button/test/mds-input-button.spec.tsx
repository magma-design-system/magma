import { newSpecPage } from '@stencil/core/testing'
import { MdsInputButton } from '../mds-input-button'

describe('mds-input-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputButton],
      html: '<mds-input-button></mds-input-button>',
    })
    expect(page.root).toEqualHtml(`
      <mds-input-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-input-button>
    `)
  })
})
