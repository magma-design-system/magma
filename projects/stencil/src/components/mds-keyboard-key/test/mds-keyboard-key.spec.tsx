import { newSpecPage } from '@stencil/core/testing'
import { MdsKeyboardKey } from '../mds-keyboard-key'

describe('mds-keyboard-key', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsKeyboardKey],
      html: '<mds-keyboard-key></mds-keyboard-key>',
    })
    expect(page.root).toEqualHtml(`
      <mds-keyboard-key>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-keyboard-key>
    `)
  })
})
