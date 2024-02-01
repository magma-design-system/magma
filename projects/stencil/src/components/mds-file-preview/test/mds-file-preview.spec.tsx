import { newSpecPage } from '@stencil/core/testing'
import { MdsFilePreview } from '../mds-file-preview'

describe('mds-file-preview', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFilePreview],
      html: '<mds-file-preview filename=""></mds-file-preview>',
    })
    expect(page.root).toEqualHtml(`
      <mds-file-preview filename="" truncate="word">
        <mock:shadow-root>
          <div class="card" part="card">
            <div class="bg-tone-neutral-10 fill-tone-neutral-04 preview preview--icon text-tone-neutral-04">
              <mds-icon class="icon"></mds-icon>
            </div>
            <mds-text class="file-name" truncate="word" typography="h6" variant="title"></mds-text>
            <footer class="infos">
              <mds-badge class="suffix" title="Formato sconosciuto" tone="quiet" variant="dark">
                default
              </mds-badge>
              <mds-text class="description" title="Formato sconosciuto" truncate="word" typography="caption" variant="info">
                Formato sconosciuto
              </mds-text>
            </footer>
          </div>
        </mock:shadow-root>
      </mds-file-preview>
    `)
  })
})
