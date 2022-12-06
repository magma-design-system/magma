import { E2EPage, newE2EPage } from '@stencil/core/testing'
import { TypographyType } from '@type/typography'

describe('mds-text', () => {
  const titleTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'action']
  const infoTypes = ['paragraph', 'detail', 'caption', 'label', 'option', 'tip']
  const monoTypes = ['snippet', 'hack']
  const typographies = [ ...titleTypes, ...infoTypes, ...monoTypes]

  const readVariants = ['detail', 'caption', 'paragraph']

  const textContent = 'Test text'

  let page: E2EPage

  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`<mds-text>${textContent}</mds-text>`)
  })

  it('renders default', async () => {
    const element = await page.find('mds-text')
    expect(element).toHaveClass('hydrated')
    expect(element).toEqualAttribute('typography', 'detail')
    expect(element.textContent).toEqual(textContent)
  })

  it.each(typographies)('renders typography %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toEqualAttribute('typography', typography)
  })

  it.each(readVariants)('renders typography %s in variant read', async (typography: TypographyType) => {
    await setTypographyRead(page, typography)
    const element = await page.find('mds-text')
    expect(element).toEqualAttribute('typography', typography)
    expect(element).toEqualAttribute('variant', 'read')
  })

  async function setTypography (page: E2EPage, typography: TypographyType): Promise<void> {
    await page.$eval('mds-text', (elem: HTMLMdsTextElement, typography: TypographyType) => {
      elem.typography = typography
    }, typography)

    return page.waitForChanges()
  }

  async function setTypographyRead (page: E2EPage, typography: TypographyType): Promise<void> {
    await page.$eval('mds-text', (elem: HTMLMdsTextElement, typography: TypographyType) => {
      elem.typography = typography
      elem.variant = 'read'
    }, typography)

    return page.waitForChanges()
  }
})
