import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-contrast', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-contrast></mds-pref-contrast>')

    const element = await page.find('mds-pref-contrast')
    expect(element).toHaveAttribute('hydrated')
  })
})
