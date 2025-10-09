import { newSpecPage } from '@stencil/core/testing'
import { MdsPrefThemeVariantItem } from '../mds-pref-theme-variant-item'

describe('mds-pref-theme-variant-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPrefThemeVariantItem],
      html: '<mds-pref-theme-variant-item></mds-pref-theme-variant-item>',
    })
    expect(page.root).toEqualHtml(`
      <mds-pref-theme-variant-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-pref-theme-variant-item>
    `)
  })
})
