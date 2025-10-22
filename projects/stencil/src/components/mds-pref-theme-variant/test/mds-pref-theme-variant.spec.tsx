import { newSpecPage } from '@stencil/core/testing'
import { MdsPrefThemeVariant } from '../mds-pref-theme-variant'

describe('mds-pref-theme-variant', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPrefThemeVariant],
      html: '<mds-pref-theme-variant></mds-pref-theme-variant>',
    })
    expect(page.root).toEqualHtml(`
      <mds-pref-theme-variant>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-pref-theme-variant>
    `)
  })
})
