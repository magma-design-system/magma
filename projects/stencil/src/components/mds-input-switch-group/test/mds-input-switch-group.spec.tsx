import { newSpecPage } from '@stencil/core/testing'
import { MdsInputSwitchGroup } from '../mds-input-switch-group'

describe('mds-input-switch-group', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsInputSwitchGroup],
      html: '<mds-input-switch-group></mds-input-switch-group>',
    })
    expect(page.root).toEqualHtml(`
      <mds-input-switch-group>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-input-switch-group>
    `)
  })
})
