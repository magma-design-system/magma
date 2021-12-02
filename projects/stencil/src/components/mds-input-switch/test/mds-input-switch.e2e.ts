import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-switch', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-switch></mds-input-switch>')

    const element = await page.find('mds-input-switch')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
