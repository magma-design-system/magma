import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion-timer', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion-timer></mds-accordion-timer>')

    const element = await page.find('mds-accordion-timer')
    expect(element).toHaveClass('hydrated')
  })
})
