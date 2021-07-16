import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-checkbox', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-checkbox></mds-input-checkbox>')

    const element = await page.find('mds-input-checkbox')
    expect(element).toHaveClass('hydrated')
  })
})
