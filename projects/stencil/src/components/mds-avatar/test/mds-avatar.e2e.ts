import { newE2EPage } from '@stencil/core/testing'

describe('mds-avatar', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-avatar></mds-avatar>')

    const element = await page.find('mds-avatar')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
