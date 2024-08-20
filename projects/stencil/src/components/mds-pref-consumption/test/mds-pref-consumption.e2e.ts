import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-consumption', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-consumption></mds-pref-consumption>')

    const element = await page.find('mds-pref-consumption')
    expect(element).toHaveAttribute('hydrated')
  })
})
