import { E2EPage, newE2EPage } from '@stencil/core/testing'
import { TypographyType } from '@type/typography'

describe('mds-text', () => {
  const titleTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'action']
  const infoTypes = ['paragraph', 'detail', 'caption', 'label', 'option', 'tip']
  const monoTypes = ['code', 'hack']
  const textContent = 'Test text'
  let page: E2EPage

  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`<mds-text>${textContent}</mds-text>`)
  })

  it('renders default', async () => {
    const element = await page.find('mds-text')
    expect(element).toHaveClass('hydrated')
    expect(element).toHaveClass('text-info-detail')
    expect(element.textContent).toEqual(textContent)
  })

  it.each(titleTypes)('renders title %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toHaveClass(`text-title-${typography}`)
  })

  it.each(infoTypes)('renders info %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toHaveClass(`text-info-${typography}`)
  })

  it.each(monoTypes)('renders mono %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toHaveClass(`text-mono-${typography}`)
  })

  async function setTypography (page: E2EPage, typography: TypographyType): Promise<void> {
    await page.$eval('mds-text', (elem: HTMLMdsTextElement, typography: TypographyType) => {
      elem.typography = typography
    }, typography)

    return page.waitForChanges()
  }
})
