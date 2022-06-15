import { E2EPage, newE2EPage } from '@stencil/core/testing'
import { TypographyType } from '@type/typography'

describe('mds-text', () => {
  const primaryTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'action']
  const secondaryTypes = ['paragraph', 'detail', 'caption', 'label', 'option', 'tip']
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
    expect(element).toHaveClass('text-secondary-detail')
    expect(element.textContent).toEqual(textContent)
  })

  it.each(primaryTypes)('renders primary %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toHaveClass(`text-primary-${typography}`)
  })

  it.each(secondaryTypes)('renders secondary %s', async (typography: TypographyType) => {
    await setTypography(page, typography)
    const element = await page.find('mds-text')
    expect(element).toHaveClass(`text-secondary-${typography}`)
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
