import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-item></mds-accordion-item>')

    const element = await page.find('mds-accordion-item')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
