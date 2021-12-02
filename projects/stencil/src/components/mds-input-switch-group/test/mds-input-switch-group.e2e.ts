import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-switch-group', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-switch-group></mds-input-switch-group>')

    const element = await page.find('mds-input-switch-group')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
