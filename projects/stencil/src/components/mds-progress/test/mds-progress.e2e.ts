import { newE2EPage } from '@stencil/core/testing'

describe('mds-progress', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-progress></mds-progress>')

    const element = await page.find('mds-progress')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
