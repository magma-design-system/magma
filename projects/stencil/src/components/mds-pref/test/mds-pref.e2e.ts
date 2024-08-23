import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref></mds-pref>')

    const element = await page.find('mds-pref')
    expect(element).toHaveAttribute('hydrated')
  })
})
