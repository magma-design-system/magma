import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-select', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-select></mds-input-select>')

    const element = await page.find('mds-input-select')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
