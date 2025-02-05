import { newE2EPage } from '@stencil/core/testing'

describe('mds-date-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-date-picker></mds-date-picker>')

    const element = await page.find('mds-date-picker')
    expect(element).toHaveClass('hydrated')
  })
})
