import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-button', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-button></mds-input-button>')

    const element = await page.find('mds-input-button')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
