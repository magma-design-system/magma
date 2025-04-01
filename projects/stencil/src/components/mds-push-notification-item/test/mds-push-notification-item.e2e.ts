import { newE2EPage } from '@stencil/core/testing'

describe('mds-push-notification-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-push-notification-item></mds-push-notification-item>')

    const element = await page.find('mds-push-notification-item')
    expect(element).toHaveAttribute('hydrated')

    expect(element.outerHTML).toEqualHtml(`
      <mds-push-notification-item date-format="timeago" deletable="" hydrated="" message="Nessun messaggio disponibile" preview="image" tone="weak"><template shadowrootmode="open">
        <div class="content" part="content">
          <div class="header">
            <div class="infos"></div>
          </div>
          <mds-text class="message" hydrated="" tag="span" truncate="all" typography="caption" variant="info">
            Nessun messaggio disponibile
          </mds-text>
        </div>
        <mds-button aria-busy="false" class="close-button no-text" hydrated="" icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot;><path d=&quot;M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59z&quot;/></svg>" size="md" tabindex="0" title="Close" tone="quiet" truncate="word" type="submit" variant="dark">
        </mds-button>
      </mds-push-notification-item>
    `)
  })
})
