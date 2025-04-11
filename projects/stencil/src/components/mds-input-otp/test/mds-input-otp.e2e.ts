import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-otp', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-otp></mds-input-otp>')

    const element = await page.find('mds-input-otp')
    expect(element).toHaveAttribute('hydrated')
  })
})
