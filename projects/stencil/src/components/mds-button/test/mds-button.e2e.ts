import { newE2EPage } from '@stencil/core/testing'

describe('mds-button', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-button></mds-button>')

    const element = await page.find('mds-button')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
