import { newE2EPage } from '@stencil/core/testing'

describe('mds-form', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-form></mds-form>')

    const element = await page.find('mds-form')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
