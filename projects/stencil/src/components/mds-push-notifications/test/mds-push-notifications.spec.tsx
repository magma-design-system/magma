import { newSpecPage } from '@stencil/core/testing'
import { MdsPushNotifications } from '../mds-push-notifications'

describe('mds-push-notifications', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPushNotifications],
      html: '<mds-push-notifications></mds-push-notifications>',
    })
    expect(page.root).toEqualHtml(`
      <mds-push-notifications>
        <mock:shadow-root>
          <mds-button variant="dark">
            Cancella notifiche
          </mds-button>
          <div class="notifications" part="notifications">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </mds-push-notifications>
    `)
  })
})
