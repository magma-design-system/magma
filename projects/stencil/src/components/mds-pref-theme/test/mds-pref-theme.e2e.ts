import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-theme', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-theme></mds-pref-theme>')

    const element = await page.find('mds-pref-theme')
    expect(element).toHaveAttribute('hydrated')
  })
})
