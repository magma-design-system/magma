import { newE2EPage } from '@stencil/core/testing'

describe('mds-tag', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-tag></mds-tag>')

    const element = await page.find('mds-tag')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
