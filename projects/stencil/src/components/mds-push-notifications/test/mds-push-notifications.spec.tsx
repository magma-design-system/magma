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
        <slot name="top"></slot>
          <div class="notifications" part="notifications">
            <slot></slot>
          </div>
         <slot name="bottom"></slot>
        </mock:shadow-root>
      </mds-push-notifications>
    `)
  })
})
