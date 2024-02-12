import { SpecPage, newSpecPage } from '@stencil/core/testing'
import { MdsInputUpload } from '../mds-input-upload'
import { mockFile, mockFileList } from '@test/file'

describe('mds-input-upload', () => {
  let page: SpecPage
  let component: HTMLMdsInputUploadElement | null

  beforeEach(async () => {
    page = await newSpecPage({
      components: [MdsInputUpload],
      html: '<mds-input-upload></mds-input-upload>',
    })
    component = page.body.querySelector('mds-input-upload')
  })

  it('should set default attribut', () => {
    expect(component).toBeDefined()
    expect(component?.accept).toBe('')
    expect(component?.maxFileSize).toBe(20)
    expect(component?.maxFiles).toBe(1)
    expect(component?.sort).toBeUndefined()
  })

  it('should accept only pdf', async () => {
    await page.setContent('<mds-input-upload accept=".pdf"></mds-input-upload>')
    await page.waitForChanges()
    component = page.body.querySelector('mds-input-upload')

    if (component) {
      const extensionText =
        component.shadowRoot?.querySelector('.file-specs')?.firstChild
      const sizeText =
        component.shadowRoot?.querySelector('.file-specs')?.lastChild

      expect(component.accept).toBe('.pdf')
      expect(
        component.shadowRoot?.querySelector('.main-actions')?.childElementCount,
      ).toBe(1)

      expect(extensionText?.textContent).toContain('PDF')
      expect(sizeText?.textContent).toContain('20')
    }
  })

  it('should show 10 max files with 5mb max file size', async () => {
    await page.setContent(
      '<mds-input-upload max-files=10 max-file-size=5></mds-input-upload>',
    )
    await page.waitForChanges()
    component = page.body.querySelector('mds-input-upload')

    if (component) {
      const extensionText =
        component.shadowRoot?.querySelector('.file-specs')?.firstChild
      const sizeText =
        component.shadowRoot?.querySelector('.file-specs')?.lastChild
      const nfilesText = component.shadowRoot?.querySelector(
        '.main-infos mds-text',
      )

      expect(component.accept).toBe('')
      expect(component.maxFiles).toBe(10)
      expect(component.maxFileSize).toBe(5)

      expect(extensionText?.textContent).toContain('')
      expect(nfilesText?.textContent).toContain('10')
      expect(sizeText?.textContent).toContain('5')
    }
  })

  it('should show sort', async () => {
    expect(component?.sort).toBeUndefined()
    const sortTab = component?.shadowRoot?.querySelector('.action-sort')
    expect(sortTab).toBeDefined()
    expect(sortTab?.firstChild).toHaveAttribute('selected')
  })

  it('should not show sort', async () => {
    await page.setContent('<mds-input-upload sort="status"></mds-input-upload>')
    await page.waitForChanges()
    component = page.body.querySelector('mds-input-upload')

    if (component) {
      expect(component?.sort).toBe('status')
      const sortTab = component?.shadowRoot?.querySelector('.action-sort')
      expect(sortTab).toBeNull()
    }
  })

  it('should set files', async () => {
    const inputElement = component?.shadowRoot?.querySelector('input') as HTMLInputElement
    if (!inputElement) throw new Error('input not found')

    inputElement.files = mockFileList([
      mockFile('file-a', 2 * 1024 * 1024),
      mockFile('file-b', 6 * 1024 * 1024),
    ])
    // cant test prepareFiles in this test Environment, dataTransfer is not defined
    // inputElement.dispatchEvent(new Event('change'))
    await page.waitForChanges()
    expect(await component?.getFiles()).toHaveLength(2)
  })

})
