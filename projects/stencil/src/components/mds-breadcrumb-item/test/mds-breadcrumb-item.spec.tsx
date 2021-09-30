import { newSpecPage } from '@stencil/core/testing'
import { MdsBreadcrumbItem } from '../mds-breadcrumb-item'

describe('mds-breadcrumb-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsBreadcrumbItem],
      html: '<mds-breadcrumb-item></mds-breadcrumb-item>',
    })
    expect(page.root).toEqualHtml(`
      <mds-breadcrumb-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-breadcrumb-item>
    `)
  })
})
