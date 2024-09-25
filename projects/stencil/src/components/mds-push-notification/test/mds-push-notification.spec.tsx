import { newSpecPage } from '@stencil/core/testing'
import { MdsPushNotification } from '../mds-push-notification'

describe('mds-push-notification', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsPushNotification],
      html: '<mds-push-notification></mds-push-notification>',
    })
    expect(page.root).toEqualHtml(`
      <mds-push-notification date-format="timeago" deletable="" message="Nessun messaggio disponibile" preview="image" tone="weak">
        <mock:shadow-root>
          <div class="content" part="content">
            <header>
              <div class="infos"></div>
            </header>
            <mds-text class="message" truncate="all" typography="caption" variant="info">
              Nessun messaggio disponibile
            </mds-text>
          </div>
          <mds-button class="close-button" title="Close">
          </mds-button>
        </mock:shadow-root>
      </mds-push-notification>
    `)
  })
})
