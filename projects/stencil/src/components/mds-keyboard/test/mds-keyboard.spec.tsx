import { newSpecPage } from '@stencil/core/testing'
import { MdsKeyboard } from '../mds-keyboard'

describe('mds-keyboard', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsKeyboard],
      html: '<mds-keyboard></mds-keyboard>',
    })
    expect(page.root).toEqualHtml(`
      <mds-keyboard>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-keyboard>
    `)
  })
})
