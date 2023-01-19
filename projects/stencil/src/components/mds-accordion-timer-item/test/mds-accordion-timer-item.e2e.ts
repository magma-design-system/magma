import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-timer-item></mds-accordion-timer-item>')

    const element = await page.find('mds-accordion-timer-item')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
