import { newE2EPage } from '@stencil/core/testing'

describe('mds-horizontal-scroll', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-horizontal-scroll></mds-horizontal-scroll>')

    const element = await page.find('mds-horizontal-scroll')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
