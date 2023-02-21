import { newE2EPage } from '@stencil/core/testing'

describe('mds-img', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-img></mds-img>')

    const element = await page.find('mds-img')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
