import { newSpecPage } from '@stencil/core/testing'
import { MdsInputCheckbox } from '../mds-input-checkbox'

describe('mds-input-checkbox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputCheckbox],
      html: '<mds-input-checkbox></mds-input-checkbox>',
    })
    expect(page.root).toEqualHtml(`
      <mds-input-checkbox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-input-checkbox>
    `)
  })
})
