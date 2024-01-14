import { newSpecPage } from '@stencil/core/testing'
import { MdsPushNotification } from '../mds-push-notification'

describe('mds-push-notification', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPushNotification],
      html: '<mds-push-notification></mds-push-notification>',
    })
    expect(page.root).toEqualHtml(`
      <mds-push-notification>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mds-push-notification>
    `)
  })
})
