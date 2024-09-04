import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion-item', () => {
  it('should hydrate', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-item></mds-accordion-item>')

    const element = await page.find('mds-accordion-item')
    expect(element).toHaveAttribute('hydrated')
  })

  it('should renders label', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-item label="titolo"></mds-accordion-item>')

    const element = await page.find('mds-accordion-item')
    expect(await element.getProperty('label')).toBe('titolo')
  })

  it('should not render contents', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-item label="titolo"></mds-accordion-item>')

    const contents = await page.find('mds-accordion-item >>> .content')
    expect(contents).toBeTruthy()
    expect(await contents.getComputedStyle()).toHaveProperty('gridTemplateRows', '0px')
    expect(await contents.getComputedStyle()).toHaveProperty('opacity', '0')
  })

  it('should renders selected', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-item selected>testo</mds-accordion-item>')
    await page.waitForChanges()
    const contents = await page.find('mds-accordion-item >>> .content')

    expect(contents).toBeTruthy()
    expect(await contents.getComputedStyle()).toHaveProperty('gridTemplateRows', expect.not.stringContaining('0px'))
    expect(await contents.getComputedStyle()).toHaveProperty('opacity', '1')
  })
})
