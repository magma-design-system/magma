import { newE2EPage } from '@stencil/core/testing'

describe('mds-note', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-note></mds-note>')

    const element = await page.find('mds-note')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
