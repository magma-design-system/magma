import { newE2EPage } from '@stencil/core/testing';

describe('mds-push-notification-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-push-notification-item></mds-push-notification-item>');

    const element = await page.find('mds-push-notification-item');
    expect(element).toHaveAttribute('hydrated');

    expect(element.outerHTML).toEqualHtml(`
      <mds-push-notification-item date-format="timeago" hydrated="" message="Nessun messaggio disponibile" preview="image" tone="weak"><template shadowrootmode="open">
        <div class="content" part="content">
          <div class="header">
            <div class="infos"></div>
          </div>
          <mds-text class="message" hydrated="" tag="span" truncate="all" typography="caption" variant="info">
            Nessun messaggio disponibile
          </mds-text>
        </div>
      </mds-push-notification-item>
    `);
  });
});
