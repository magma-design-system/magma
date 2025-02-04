import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-date-range', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-date-range></mds-input-date-range>')

    const element = await page.find('mds-input-date-range')
    expect(element).toHaveAttribute('hydrated')
  })
})
