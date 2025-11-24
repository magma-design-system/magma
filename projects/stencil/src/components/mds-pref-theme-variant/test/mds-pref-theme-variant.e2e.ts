import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-theme-variant', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-theme-variant></mds-pref-theme-variant>')

    const element = await page.find('mds-pref-theme-variant')
    expect(element).toHaveAttribute('hydrated')
  })
})
