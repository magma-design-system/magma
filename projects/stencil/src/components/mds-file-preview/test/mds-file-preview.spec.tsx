import { newSpecPage } from '@stencil/core/testing'
import { MdsFilePreview } from '../mds-file-preview'

describe('mds-file-preview', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MdsFilePreview],
      html: '<mds-file-preview lang="it" filename=""></mds-file-preview>',
    })
    expect(page.root).toEqualHtml(`
      <mds-file-preview lang="it" filename="" format="attachment" truncate="word">
        <mock:shadow-root>
          <div class="card" part="card">
            <div class="preview preview--icon">
              <mds-icon class="icon"></mds-icon>
            </div>
            <mds-text class="file-name" truncate="word" typography="h6" variant="title"></mds-text>
            <footer class="infos">
              <mds-badge class="suffix" title="Formato file sconosciuto" tone="weak" variant="dark">
                default
              </mds-badge>
              <mds-text class="description" title="Formato file sconosciuto" truncate="word" typography="caption" variant="info">
                Formato file sconosciuto
              </mds-text>
            </footer>
          </div>
        </mock:shadow-root>
      </mds-file-preview>
    `)
  })
})
